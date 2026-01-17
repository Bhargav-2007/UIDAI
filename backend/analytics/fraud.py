"""
Fraud & Integrity Analytics Module
Provides explainable calculations for fraud detection and data integrity analysis.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy import stats
from collections import Counter
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_enrolment_data, load_demographic_data, load_biometric_data

router = APIRouter(prefix="/api/fraud", tags=["Fraud & Integrity"])


@router.get("/benford")
async def benford_law_analysis() -> Dict[str, Any]:
    """
    Benford's Law Analysis - Detect anomalies in first-digit distribution.
    Natural data follows a predictable pattern where lower digits appear more frequently.
    """
    df = load_enrolment_data()
    
    # Step 1: Extract first digits from enrolment counts
    values = df['total_enrolments'].dropna()
    values = values[values > 0]  # Only positive values
    
    first_digits = [int(str(abs(int(v)))[0]) for v in values if v >= 1]
    first_digits = [d for d in first_digits if 1 <= d <= 9]
    
    # Step 2: Calculate observed frequencies
    digit_counts = Counter(first_digits)
    total_count = len(first_digits)
    observed_freq = {d: digit_counts.get(d, 0) / total_count for d in range(1, 10)}
    
    # Step 3: Calculate expected frequencies using Benford's Law
    # Formula: P(d) = log₁₀(1 + 1/d)
    expected_freq = {d: np.log10(1 + 1/d) for d in range(1, 10)}
    
    # Step 4: Calculate Chi-Square statistic
    chi_square = 0
    chi_square_steps = []
    for d in range(1, 10):
        observed = observed_freq[d] * total_count
        expected = expected_freq[d] * total_count
        contribution = ((observed - expected) ** 2) / expected if expected > 0 else 0
        chi_square += contribution
        chi_square_steps.append({
            "digit": d,
            "observed_count": int(observed),
            "expected_count": round(expected, 2),
            "chi_contribution": round(contribution, 4)
        })
    
    # Step 5: Calculate p-value
    degrees_of_freedom = 8  # 9 digits - 1
    p_value = 1 - stats.chi2.cdf(chi_square, degrees_of_freedom)
    
    # Risk classification
    if p_value < 0.01:
        risk = "HIGH"
        decision = "Significant deviation from Benford's Law detected - requires investigation"
    elif p_value < 0.05:
        risk = "MEDIUM"
        decision = "Moderate deviation - recommend review of data collection process"
    else:
        risk = "LOW"
        decision = "Data follows expected natural distribution pattern"
    
    return {
        "technique": "Benford's Law",
        "description": "Statistical analysis checking if first-digit distribution follows natural patterns. Fraudulent or manipulated data often deviates from this law.",
        "formula": "P(d) = log₁₀(1 + 1/d) where d is the first digit (1-9)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Extract First Digits",
                "description": "Extract the leading digit from each enrolment count value",
                "input": f"Total values analyzed: {total_count:,}",
                "output": f"First digits extracted from {len(values):,} records"
            },
            {
                "step": 2,
                "title": "Calculate Observed Frequencies",
                "description": "Count occurrences of each digit (1-9) and calculate percentages",
                "input": "First digit counts",
                "output": {d: f"{observed_freq[d]*100:.2f}%" for d in range(1, 10)}
            },
            {
                "step": 3,
                "title": "Calculate Expected Frequencies (Benford's Law)",
                "description": "Apply formula P(d) = log₁₀(1 + 1/d) for each digit",
                "input": "Digits 1-9",
                "output": {d: f"{expected_freq[d]*100:.2f}%" for d in range(1, 10)}
            },
            {
                "step": 4,
                "title": "Compute Chi-Square Statistic",
                "description": "χ² = Σ (Observed - Expected)² / Expected",
                "input": "Observed vs Expected counts",
                "output": f"χ² = {chi_square:.4f}",
                "details": chi_square_steps
            },
            {
                "step": 5,
                "title": "Calculate P-Value",
                "description": "Probability of observing this deviation by chance",
                "input": f"χ² = {chi_square:.4f}, df = {degrees_of_freedom}",
                "output": f"p-value = {p_value:.6f}"
            }
        ],
        "intermediate_values": {
            "observed_frequencies": {str(d): round(observed_freq[d], 4) for d in range(1, 10)},
            "expected_frequencies": {str(d): round(expected_freq[d], 4) for d in range(1, 10)},
            "sample_size": total_count
        },
        "final_result": {
            "chi_square": round(chi_square, 4),
            "p_value": round(p_value, 6),
            "degrees_of_freedom": degrees_of_freedom
        },
        "risk_classification": risk,
        "decision": decision,
        "visualization_data": {
            "labels": [str(d) for d in range(1, 10)],
            "observed": [round(observed_freq[d] * 100, 2) for d in range(1, 10)],
            "expected": [round(expected_freq[d] * 100, 2) for d in range(1, 10)]
        }
    }


@router.get("/outliers")
async def outlier_detection() -> Dict[str, Any]:
    """
    Outlier Detection using Z-score and IQR methods.
    Identifies districts with unusually high or low enrolment values.
    """
    df = load_enrolment_data()
    
    # Aggregate by district
    district_totals = df.groupby(['state', 'district'])['total_enrolments'].sum().reset_index()
    values = district_totals['total_enrolments'].values
    
    # === Z-Score Method ===
    mean_val = np.mean(values)
    std_val = np.std(values)
    z_scores = (values - mean_val) / std_val if std_val > 0 else np.zeros_like(values)
    
    z_threshold = 2.5
    z_outliers_mask = np.abs(z_scores) > z_threshold
    z_outlier_count = np.sum(z_outliers_mask)
    
    # === IQR Method ===
    q1 = np.percentile(values, 25)
    q3 = np.percentile(values, 75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    iqr_outliers_mask = (values < lower_bound) | (values > upper_bound)
    iqr_outlier_count = np.sum(iqr_outliers_mask)
    
    # Combined outliers (flagged by both methods)
    combined_mask = z_outliers_mask & iqr_outliers_mask
    
    # Get outlier details
    outlier_details = []
    for idx in np.where(combined_mask)[0]:
        row = district_totals.iloc[idx]
        outlier_details.append({
            "state": row['state'],
            "district": row['district'],
            "value": int(row['total_enrolments']),
            "z_score": round(z_scores[idx], 2),
            "type": "spike" if z_scores[idx] > 0 else "drop"
        })
    
    # Sort by absolute z-score
    outlier_details = sorted(outlier_details, key=lambda x: abs(x['z_score']), reverse=True)[:15]
    
    # Risk assessment
    outlier_rate = combined_mask.sum() / len(values) * 100
    if outlier_rate > 5:
        risk = "HIGH"
        decision = "Significant number of outliers detected - data quality review recommended"
    elif outlier_rate > 2:
        risk = "MEDIUM"
        decision = "Some outliers present - investigate flagged districts"
    else:
        risk = "LOW"
        decision = "Outlier rate within acceptable limits"
    
    return {
        "technique": "Outlier Detection (Z-score & IQR)",
        "description": "Identifies statistical outliers using two complementary methods: Z-score (standard deviations from mean) and IQR (interquartile range).",
        "formula": "Z-score: z = (x - μ) / σ | IQR: Outlier if x < Q1-1.5×IQR or x > Q3+1.5×IQR",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate Data by District",
                "description": "Sum enrolments for each district across all dates",
                "input": f"{len(df):,} records",
                "output": f"{len(district_totals):,} unique districts"
            },
            {
                "step": 2,
                "title": "Calculate Z-Score Statistics",
                "description": "Compute mean (μ) and standard deviation (σ)",
                "input": "District enrolment totals",
                "output": f"μ = {mean_val:,.0f}, σ = {std_val:,.0f}"
            },
            {
                "step": 3,
                "title": "Apply Z-Score Threshold",
                "description": f"Flag values where |z| > {z_threshold}",
                "input": f"Threshold = {z_threshold}",
                "output": f"{z_outlier_count} outliers detected"
            },
            {
                "step": 4,
                "title": "Calculate IQR Bounds",
                "description": "Compute quartiles and interquartile range",
                "input": "Sorted values",
                "output": f"Q1 = {q1:,.0f}, Q3 = {q3:,.0f}, IQR = {iqr:,.0f}"
            },
            {
                "step": 5,
                "title": "Apply IQR Bounds",
                "description": "Flag values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]",
                "input": f"Bounds: [{lower_bound:,.0f}, {upper_bound:,.0f}]",
                "output": f"{iqr_outlier_count} outliers detected"
            },
            {
                "step": 6,
                "title": "Combine Methods",
                "description": "Identify districts flagged by BOTH methods for high confidence",
                "input": f"Z-score: {z_outlier_count}, IQR: {iqr_outlier_count}",
                "output": f"{combined_mask.sum()} confirmed outliers"
            }
        ],
        "intermediate_values": {
            "z_score_stats": {"mean": round(mean_val, 2), "std": round(std_val, 2), "threshold": z_threshold},
            "iqr_stats": {"q1": round(q1, 2), "q3": round(q3, 2), "iqr": round(iqr, 2)},
            "iqr_bounds": {"lower": round(lower_bound, 2), "upper": round(upper_bound, 2)}
        },
        "final_result": {
            "total_districts": len(district_totals),
            "z_score_outliers": int(z_outlier_count),
            "iqr_outliers": int(iqr_outlier_count),
            "confirmed_outliers": int(combined_mask.sum()),
            "outlier_rate_percent": round(outlier_rate, 2)
        },
        "risk_classification": risk,
        "decision": decision,
        "flagged_districts": outlier_details,
        "visualization_data": {
            "histogram": {
                "values": [int(v) for v in np.histogram(values, bins=30)[0]],
                "bin_edges": [round(v, 0) for v in np.histogram(values, bins=30)[1]]
            },
            "bounds": {"lower": round(lower_bound, 0), "upper": round(upper_bound, 0), "mean": round(mean_val, 0)}
        }
    }


@router.get("/patterns")
async def pattern_recognition() -> Dict[str, Any]:
    """
    Time-based Pattern Recognition.
    Identifies suspicious patterns like weekend spikes or month-end surges.
    """
    df = load_enrolment_data()
    
    # Add time features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['is_weekend'] = df['day_of_week'].isin([5, 6])
    df['is_month_end'] = df['day_of_month'] >= 25
    
    # Daily aggregation
    daily_totals = df.groupby('date')['total_enrolments'].sum().reset_index()
    daily_totals['day_of_week'] = daily_totals['date'].dt.dayofweek
    daily_totals['is_weekend'] = daily_totals['day_of_week'].isin([5, 6])
    
    # Pattern 1: Day-of-week analysis
    dow_analysis = df.groupby('day_of_week')['total_enrolments'].agg(['mean', 'std', 'sum']).reset_index()
    dow_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    dow_analysis['day_name'] = [dow_names[i] for i in dow_analysis['day_of_week']]
    
    overall_mean = df['total_enrolments'].mean()
    dow_analysis['deviation_percent'] = ((dow_analysis['mean'] - overall_mean) / overall_mean * 100).round(2)
    
    # Pattern 2: Weekend vs Weekday
    weekday_mean = daily_totals[~daily_totals['is_weekend']]['total_enrolments'].mean()
    weekend_mean = daily_totals[daily_totals['is_weekend']]['total_enrolments'].mean()
    weekend_ratio = weekend_mean / weekday_mean if weekday_mean > 0 else 0
    
    # Pattern 3: Month-end surge detection
    month_end_data = df[df['is_month_end']]['total_enrolments']
    other_data = df[~df['is_month_end']]['total_enrolments']
    month_end_mean = month_end_data.mean()
    other_mean = other_data.mean()
    month_end_surge = ((month_end_mean - other_mean) / other_mean * 100) if other_mean > 0 else 0
    
    # Detect anomalous patterns
    patterns_detected = []
    
    if weekend_ratio > 1.2:
        patterns_detected.append({
            "pattern": "Weekend Spike",
            "severity": "HIGH",
            "description": f"Weekend activity {(weekend_ratio-1)*100:.1f}% higher than weekdays"
        })
    elif weekend_ratio < 0.5:
        patterns_detected.append({
            "pattern": "Weekend Drop",
            "severity": "MEDIUM", 
            "description": f"Weekend activity {(1-weekend_ratio)*100:.1f}% lower than weekdays"
        })
    
    if month_end_surge > 30:
        patterns_detected.append({
            "pattern": "Month-End Surge",
            "severity": "MEDIUM",
            "description": f"Activity increases {month_end_surge:.1f}% in last week of month"
        })
    
    # Risk assessment
    if len([p for p in patterns_detected if p['severity'] == 'HIGH']) > 0:
        risk = "HIGH"
        decision = "Suspicious time-based patterns detected - investigate potential data manipulation"
    elif len(patterns_detected) > 0:
        risk = "MEDIUM"
        decision = "Some timing patterns detected - may indicate operational or behavioral factors"
    else:
        risk = "LOW"
        decision = "No suspicious time-based patterns detected"
    
    return {
        "technique": "Time-Based Pattern Recognition",
        "description": "Analyzes temporal patterns in data to detect anomalies like unusual weekend activity or month-end surges that might indicate manipulation.",
        "formula": "Deviation % = (Pattern Mean - Overall Mean) / Overall Mean × 100",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Extract Time Features",
                "description": "Derive day-of-week, day-of-month, weekend flags from dates",
                "input": f"{len(df):,} records with dates",
                "output": "Added: day_of_week, is_weekend, is_month_end"
            },
            {
                "step": 2,
                "title": "Day-of-Week Analysis",
                "description": "Calculate mean enrolments for each day of the week",
                "input": "Grouped by day_of_week",
                "output": {row['day_name']: f"{row['deviation_percent']:+.1f}%" for _, row in dow_analysis.iterrows()}
            },
            {
                "step": 3,
                "title": "Weekend vs Weekday Comparison",
                "description": "Compare aggregate weekend activity to weekday activity",
                "input": f"Weekday mean: {weekday_mean:,.0f}, Weekend mean: {weekend_mean:,.0f}",
                "output": f"Weekend ratio: {weekend_ratio:.2f}"
            },
            {
                "step": 4,
                "title": "Month-End Surge Detection",
                "description": "Compare last week of month (days 25-31) to other days",
                "input": f"Month-end mean: {month_end_mean:,.0f}, Other: {other_mean:,.0f}",
                "output": f"Surge: {month_end_surge:+.1f}%"
            },
            {
                "step": 5,
                "title": "Pattern Classification",
                "description": "Flag patterns exceeding risk thresholds",
                "input": "Weekend ratio > 1.2, Month-end surge > 30%",
                "output": f"{len(patterns_detected)} patterns detected"
            }
        ],
        "intermediate_values": {
            "overall_mean": round(overall_mean, 2),
            "weekday_mean": round(weekday_mean, 2),
            "weekend_mean": round(weekend_mean, 2),
            "weekend_ratio": round(weekend_ratio, 3),
            "month_end_surge_percent": round(month_end_surge, 2)
        },
        "final_result": {
            "patterns_detected": len(patterns_detected),
            "day_of_week_variance": round(dow_analysis['deviation_percent'].std(), 2)
        },
        "risk_classification": risk,
        "decision": decision,
        "patterns": patterns_detected,
        "visualization_data": {
            "day_of_week": {
                "labels": dow_analysis['day_name'].tolist(),
                "values": [round(v, 0) for v in dow_analysis['mean'].tolist()],
                "deviations": dow_analysis['deviation_percent'].tolist()
            }
        }
    }


@router.get("/duplicates")
async def duplicate_detection() -> Dict[str, Any]:
    """
    Identity Resolution - Detect potential duplicate or suspicious records.
    Analyzes same-day, same-location patterns that might indicate data issues.
    """
    df = load_enrolment_data()
    
    # Create composite keys for duplicate detection
    df['location_key'] = df['state'] + '_' + df['district'] + '_' + df['pincode'].astype(str)
    df['date_location_key'] = df['date'].astype(str) + '_' + df['location_key']
    
    # Step 1: Count records per date-location combination
    location_date_counts = df.groupby('date_location_key').size().reset_index(name='count')
    
    # Step 2: Identify locations with multiple entries on same day
    multi_entry = location_date_counts[location_date_counts['count'] > 1]
    
    # Step 3: Analyze exact value duplicates
    value_cols = ['total_enrolments', 'age_0_5', 'age_5_17', 'age_18_greater']
    available_cols = [c for c in value_cols if c in df.columns]
    
    if available_cols:
        df['value_signature'] = df[available_cols].apply(lambda x: '_'.join(x.astype(str)), axis=1)
        exact_dupes = df.groupby(['date', 'state', 'district', 'value_signature']).size().reset_index(name='count')
        exact_dupes = exact_dupes[exact_dupes['count'] > 1]
        exact_dupe_count = len(exact_dupes)
    else:
        exact_dupe_count = 0
    
    # Step 4: Detect suspiciously identical values across different locations
    value_distribution = df['total_enrolments'].value_counts()
    repeated_values = value_distribution[value_distribution > 100]  # Values appearing 100+ times
    
    # Step 5: Calculate duplicate metrics
    total_records = len(df)
    multi_entry_records = multi_entry['count'].sum() if len(multi_entry) > 0 else 0
    duplicate_rate = (multi_entry_records / total_records * 100) if total_records > 0 else 0
    
    # Suspicious findings
    suspicious_findings = []
    if len(repeated_values) > 0:
        for val, count in repeated_values.head(5).items():
            suspicious_findings.append({
                "type": "Repeated Value",
                "value": int(val),
                "occurrences": int(count),
                "concern": "Same enrolment count appearing frequently across locations"
            })
    
    # Risk assessment
    if duplicate_rate > 5 or exact_dupe_count > 100:
        risk = "HIGH"
        decision = "Significant duplicate patterns detected - data integrity review required"
    elif duplicate_rate > 1 or exact_dupe_count > 20:
        risk = "MEDIUM"
        decision = "Some duplicate patterns found - recommend investigation"
    else:
        risk = "LOW"
        decision = "Duplicate rate within acceptable limits"
    
    return {
        "technique": "Identity Resolution & Duplicate Detection",
        "description": "Identifies potential duplicate records and suspicious patterns in data that might indicate data entry errors or manipulation.",
        "formula": "Duplicate Rate = (Multi-entry records / Total records) × 100",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Create Location Keys",
                "description": "Generate unique keys combining state, district, and pincode",
                "input": f"{total_records:,} records",
                "output": f"{df['location_key'].nunique():,} unique locations"
            },
            {
                "step": 2,
                "title": "Identify Multi-Entry Locations",
                "description": "Find locations with multiple records on the same day",
                "input": "Date + Location combinations",
                "output": f"{len(multi_entry):,} multi-entry cases"
            },
            {
                "step": 3,
                "title": "Detect Exact Value Duplicates",
                "description": "Find records with identical values across all metrics",
                "input": f"Columns: {available_cols}",
                "output": f"{exact_dupe_count} exact duplicate sets"
            },
            {
                "step": 4,
                "title": "Analyze Value Repetition",
                "description": "Identify suspiciously common values (appearing 100+ times)",
                "input": "Enrolment value distribution",
                "output": f"{len(repeated_values)} repeated values found"
            },
            {
                "step": 5,
                "title": "Calculate Duplicate Rate",
                "description": "Compute overall duplicate percentage",
                "input": f"Multi-entry: {multi_entry_records:,}, Total: {total_records:,}",
                "output": f"Rate: {duplicate_rate:.2f}%"
            }
        ],
        "intermediate_values": {
            "total_records": total_records,
            "unique_locations": int(df['location_key'].nunique()),
            "multi_entry_cases": len(multi_entry),
            "multi_entry_records": int(multi_entry_records),
            "exact_duplicate_sets": exact_dupe_count
        },
        "final_result": {
            "duplicate_rate_percent": round(duplicate_rate, 2),
            "suspicious_values": len(repeated_values),
            "integrity_score": round(100 - duplicate_rate, 2)
        },
        "risk_classification": risk,
        "decision": decision,
        "suspicious_findings": suspicious_findings[:5],
        "visualization_data": {
            "duplicate_breakdown": {
                "labels": ["Clean Records", "Multi-Entry", "Exact Duplicates"],
                "values": [
                    total_records - multi_entry_records,
                    int(multi_entry_records),
                    exact_dupe_count
                ]
            }
        }
    }


@router.get("/forensic")
async def forensic_analytics() -> Dict[str, Any]:
    """
    Forensic Analytics Summary - Comprehensive data integrity assessment.
    Combines multiple detection techniques for overall fraud risk scoring.
    """
    df = load_enrolment_data()
    
    # === Metric 1: Data Completeness ===
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    completeness_score = ((total_cells - missing_cells) / total_cells * 100) if total_cells > 0 else 0
    
    # === Metric 2: Value Range Validity ===
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    negative_counts = sum([(df[col] < 0).sum() for col in numeric_cols if col != 'pincode'])
    range_validity_score = 100 - (negative_counts / len(df) * 100) if len(df) > 0 else 100
    
    # === Metric 3: Temporal Consistency ===
    date_gaps = df.groupby('date').size()
    if len(date_gaps) > 1:
        date_variance = date_gaps.std() / date_gaps.mean() * 100 if date_gaps.mean() > 0 else 0
        temporal_score = max(0, 100 - date_variance)
    else:
        temporal_score = 100
    
    # === Metric 4: Geographic Coverage ===
    expected_states = 36  # Approximate Indian states/UTs
    actual_states = df['state'].nunique()
    coverage_score = min(100, (actual_states / expected_states * 100))
    
    # === Metric 5: Statistical Normality ===
    values = df['total_enrolments'].dropna()
    if len(values) > 100:
        # Simplified normality check using skewness
        skewness = values.skew()
        normality_score = max(0, 100 - abs(skewness) * 20)
    else:
        normality_score = 50  # Insufficient data
    
    # Calculate overall integrity score
    weights = {
        "completeness": 0.25,
        "range_validity": 0.20,
        "temporal": 0.20,
        "coverage": 0.15,
        "normality": 0.20
    }
    
    overall_score = (
        completeness_score * weights["completeness"] +
        range_validity_score * weights["range_validity"] +
        temporal_score * weights["temporal"] +
        coverage_score * weights["coverage"] +
        normality_score * weights["normality"]
    )
    
    # Risk assessment
    if overall_score >= 85:
        risk = "LOW"
        decision = "Data integrity is strong - suitable for analytical use"
    elif overall_score >= 70:
        risk = "MEDIUM"
        decision = "Some data quality issues detected - review before critical decisions"
    else:
        risk = "HIGH"
        decision = "Significant data quality concerns - thorough investigation required"
    
    # Generate recommendations
    recommendations = []
    if completeness_score < 90:
        recommendations.append("Address missing data in key fields")
    if range_validity_score < 95:
        recommendations.append("Investigate negative or invalid values")
    if temporal_score < 80:
        recommendations.append("Review temporal data consistency")
    if coverage_score < 80:
        recommendations.append("Expand geographic data coverage")
    if normality_score < 60:
        recommendations.append("Investigate statistical distribution anomalies")
    
    return {
        "technique": "Forensic Analytics",
        "description": "Comprehensive data integrity assessment combining multiple metrics to provide an overall fraud risk score and actionable recommendations.",
        "formula": "Overall Score = Σ(Metric Score × Weight) | Risk = f(Overall Score)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Data Completeness Analysis",
                "description": "Calculate percentage of non-null values across all fields",
                "input": f"Total cells: {total_cells:,}, Missing: {missing_cells:,}",
                "output": f"Completeness: {completeness_score:.1f}%",
                "weight": weights["completeness"]
            },
            {
                "step": 2,
                "title": "Value Range Validity",
                "description": "Check for negative or invalid values in numeric fields",
                "input": f"Checked {len(numeric_cols)} numeric columns",
                "output": f"Validity: {range_validity_score:.1f}%",
                "weight": weights["range_validity"]
            },
            {
                "step": 3,
                "title": "Temporal Consistency",
                "description": "Analyze variance in daily record counts",
                "input": f"Date range: {len(date_gaps)} days",
                "output": f"Temporal score: {temporal_score:.1f}%",
                "weight": weights["temporal"]
            },
            {
                "step": 4,
                "title": "Geographic Coverage",
                "description": "Assess state/UT representation in data",
                "input": f"Expected: {expected_states}, Actual: {actual_states}",
                "output": f"Coverage: {coverage_score:.1f}%",
                "weight": weights["coverage"]
            },
            {
                "step": 5,
                "title": "Statistical Normality",
                "description": "Check distribution characteristics of enrolment data",
                "input": f"Sample size: {len(values):,}",
                "output": f"Normality: {normality_score:.1f}%",
                "weight": weights["normality"]
            },
            {
                "step": 6,
                "title": "Calculate Overall Score",
                "description": "Apply weighted average of all metrics",
                "input": "Individual scores with weights",
                "output": f"Overall: {overall_score:.1f}%"
            }
        ],
        "intermediate_values": {
            "completeness_score": round(completeness_score, 2),
            "range_validity_score": round(range_validity_score, 2),
            "temporal_score": round(temporal_score, 2),
            "coverage_score": round(coverage_score, 2),
            "normality_score": round(normality_score, 2),
            "weights": weights
        },
        "final_result": {
            "overall_integrity_score": round(overall_score, 2),
            "total_records_analyzed": len(df),
            "states_covered": actual_states,
            "date_range_days": len(date_gaps)
        },
        "risk_classification": risk,
        "decision": decision,
        "recommendations": recommendations,
        "visualization_data": {
            "radar_chart": {
                "labels": ["Completeness", "Range Validity", "Temporal", "Coverage", "Normality"],
                "values": [
                    round(completeness_score, 1),
                    round(range_validity_score, 1),
                    round(temporal_score, 1),
                    round(coverage_score, 1),
                    round(normality_score, 1)
                ]
            },
            "overall_gauge": round(overall_score, 1)
        }
    }
