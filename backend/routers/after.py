"""
After Analysis Router
Provides endpoints for advanced analytics including trends, anomalies, insights, and forecasts.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

from data_loader import (
    load_enrolment_data,
    load_demographic_data,
    load_biometric_data,
    aggregate_by_month,
    aggregate_by_state_month
)

router = APIRouter(prefix="/api/after", tags=["After Analysis"])


def calculate_growth_rates(df: pd.DataFrame, value_col: str) -> pd.DataFrame:
    """
    Calculate Month-over-Month (MoM) and Year-over-Year (YoY) growth rates.
    
    Args:
        df: DataFrame with 'year_month' and value columns
        value_col: Name of the value column
    
    Returns:
        DataFrame with growth rate columns added
    """
    df = df.copy()
    df = df.sort_values('year_month')
    
    # Month-over-Month growth rate
    df['mom_growth'] = df[value_col].pct_change() * 100
    
    # Year-over-Year growth rate (12 months back)
    df['yoy_growth'] = df[value_col].pct_change(periods=12) * 100
    
    # Fill NaN with 0
    df['mom_growth'] = df['mom_growth'].fillna(0).round(2)
    df['yoy_growth'] = df['yoy_growth'].fillna(0).round(2)
    
    return df


@router.get("/trends")
async def get_trends() -> Dict[str, Any]:
    """
    Return time-series trends of enrolment and updates with growth rates.
    
    Provides:
    - Time-series data with MoM and YoY growth rates
    - Overall trend direction
    - Peak and lowest activity periods
    """
    # Load data
    enrolment_df = load_enrolment_data()
    demographic_df = load_demographic_data()
    biometric_df = load_biometric_data()
    
    # Monthly aggregations
    enrolment_monthly = aggregate_by_month(enrolment_df, 'total_enrolments')
    demographic_monthly = aggregate_by_month(demographic_df, 'total_demo_updates')
    biometric_monthly = aggregate_by_month(biometric_df, 'total_bio_updates')
    
    # Calculate growth rates
    enrolment_trends = calculate_growth_rates(enrolment_monthly, 'total_enrolments')
    demographic_trends = calculate_growth_rates(demographic_monthly, 'total_demo_updates')
    biometric_trends = calculate_growth_rates(biometric_monthly, 'total_bio_updates')
    
    # Determine overall trend
    def get_trend_direction(df: pd.DataFrame, value_col: str) -> str:
        if len(df) < 2:
            return "insufficient_data"
        recent = df[value_col].tail(3).mean()
        earlier = df[value_col].head(3).mean()
        if recent > earlier * 1.1:
            return "increasing"
        elif recent < earlier * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    # Find peak and low periods
    def get_peak_low(df: pd.DataFrame, value_col: str) -> Dict:
        if len(df) == 0:
            return {"peak_month": None, "peak_value": 0, "low_month": None, "low_value": 0}
        peak_idx = df[value_col].idxmax()
        low_idx = df[value_col].idxmin()
        return {
            "peak_month": df.loc[peak_idx, 'year_month'],
            "peak_value": int(df.loc[peak_idx, value_col]),
            "low_month": df.loc[low_idx, 'year_month'],
            "low_value": int(df.loc[low_idx, value_col])
        }
    
    return {
        "message": "Analyzed Trends with Growth Intelligence",
        "trends": {
            "enrolment": {
                "time_series": enrolment_trends.to_dict('records'),
                "overall_trend": get_trend_direction(enrolment_trends, 'total_enrolments'),
                "peak_low": get_peak_low(enrolment_trends, 'total_enrolments'),
                "avg_mom_growth": round(enrolment_trends['mom_growth'].mean(), 2),
                "total": int(enrolment_trends['total_enrolments'].sum())
            },
            "demographic_updates": {
                "time_series": demographic_trends.to_dict('records'),
                "overall_trend": get_trend_direction(demographic_trends, 'total_demo_updates'),
                "peak_low": get_peak_low(demographic_trends, 'total_demo_updates'),
                "avg_mom_growth": round(demographic_trends['mom_growth'].mean(), 2),
                "total": int(demographic_trends['total_demo_updates'].sum())
            },
            "biometric_updates": {
                "time_series": biometric_trends.to_dict('records'),
                "overall_trend": get_trend_direction(biometric_trends, 'total_bio_updates'),
                "peak_low": get_peak_low(biometric_trends, 'total_bio_updates'),
                "avg_mom_growth": round(biometric_trends['mom_growth'].mean(), 2),
                "total": int(biometric_trends['total_bio_updates'].sum())
            }
        }
    }


def detect_anomalies_zscore(df: pd.DataFrame, value_col: str, threshold: float = 2.0) -> List[Dict]:
    """
    Detect anomalies using Z-score method.
    
    Args:
        df: DataFrame with value column
        value_col: Column to analyze
        threshold: Z-score threshold for anomaly detection (default 2.0)
    
    Returns:
        List of detected anomalies with explanations
    """
    if len(df) < 3:
        return []
    
    values = df[value_col].values
    z_scores = np.abs(stats.zscore(values))
    
    anomalies = []
    for i, (z, val) in enumerate(zip(z_scores, values)):
        if z > threshold:
            row = df.iloc[i]
            mean_val = np.mean(values)
            anomaly_type = "spike" if val > mean_val else "drop"
            deviation = ((val - mean_val) / mean_val) * 100 if mean_val != 0 else 0
            
            anomalies.append({
                "index": i,
                "year_month": row.get('year_month', str(i)),
                "state": row.get('state', 'National'),
                "district": row.get('district', 'All'),
                "value": int(val),
                "z_score": round(z, 2),
                "anomaly_type": anomaly_type,
                "deviation_percent": round(deviation, 1),
                "explanation": f"This represents a significant {anomaly_type} - {abs(round(deviation, 1))}% {'above' if anomaly_type == 'spike' else 'below'} average. Z-score: {round(z, 2)}"
            })
    
    return anomalies


@router.get("/anomalies")
async def get_anomalies() -> Dict[str, Any]:
    """
    Detect sudden spikes or drops using Z-score analysis.
    
    Returns:
    - Flagged states/districts with unusual activity
    - Explanation for each anomaly
    - Severity classification
    """
    # Load data
    enrolment_df = load_enrolment_data()
    demographic_df = load_demographic_data()
    biometric_df = load_biometric_data()
    
    # Monthly aggregations for national-level anomalies
    enrolment_monthly = aggregate_by_month(enrolment_df, 'total_enrolments')
    demographic_monthly = aggregate_by_month(demographic_df, 'total_demo_updates')
    biometric_monthly = aggregate_by_month(biometric_df, 'total_bio_updates')
    
    # Detect national-level anomalies
    national_anomalies = {
        "enrolment": detect_anomalies_zscore(enrolment_monthly, 'total_enrolments'),
        "demographic": detect_anomalies_zscore(demographic_monthly, 'total_demo_updates'),
        "biometric": detect_anomalies_zscore(biometric_monthly, 'total_bio_updates')
    }
    
    # State-level anomaly detection
    state_monthly = aggregate_by_state_month(enrolment_df, 'total_enrolments')
    state_totals = state_monthly.groupby('state')['total_enrolments'].sum().reset_index()
    state_anomalies = detect_anomalies_zscore(state_totals, 'total_enrolments', threshold=1.5)
    
    # District-level anomalies (top unusual districts)
    district_totals = enrolment_df.groupby(['state', 'district'])['total_enrolments'].sum().reset_index()
    district_anomalies = detect_anomalies_zscore(district_totals, 'total_enrolments', threshold=2.5)
    
    # Summary stats
    total_national = len(national_anomalies['enrolment']) + len(national_anomalies['demographic']) + len(national_anomalies['biometric'])
    
    return {
        "message": "Anomaly Detection Analysis",
        "method": "Z-score based statistical analysis",
        "threshold_info": "Values with Z-score > 2.0 are flagged as anomalies",
        "summary": {
            "total_national_anomalies": total_national,
            "total_state_anomalies": len(state_anomalies),
            "total_district_anomalies": len(district_anomalies)
        },
        "national_level": national_anomalies,
        "state_level": state_anomalies[:10],  # Top 10
        "district_level": district_anomalies[:15]  # Top 15
    }


@router.get("/insights")
async def get_insights() -> Dict[str, Any]:
    """
    Generate high-level interpreted insights from the data.
    
    Returns:
    - Key findings and interpretations
    - Policy implications
    - Comparative analysis
    """
    # Load data
    enrolment_df = load_enrolment_data()
    demographic_df = load_demographic_data()
    biometric_df = load_biometric_data()
    
    # Calculate key metrics
    total_enrolments = int(enrolment_df['total_enrolments'].sum())
    total_demo_updates = int(demographic_df['total_demo_updates'].sum())
    total_bio_updates = int(biometric_df['total_bio_updates'].sum())
    
    # Age group analysis
    age_0_5 = int(enrolment_df['age_0_5'].sum()) if 'age_0_5' in enrolment_df.columns else 0
    age_5_17 = int(enrolment_df['age_5_17'].sum()) if 'age_5_17' in enrolment_df.columns else 0
    age_18_plus = int(enrolment_df['age_18_greater'].sum()) if 'age_18_greater' in enrolment_df.columns else 0
    
    # State analysis
    state_totals = enrolment_df.groupby('state')['total_enrolments'].sum().sort_values(ascending=False)
    top_5_states = state_totals.head(5).to_dict()
    bottom_5_states = state_totals.tail(5).to_dict()
    
    # Calculate coverage insights
    num_states = enrolment_df['state'].nunique()
    num_districts = enrolment_df['district'].nunique()
    
    # Date range
    date_range_days = (enrolment_df['date'].max() - enrolment_df['date'].min()).days
    
    # Generate insights
    insights = [
        {
            "category": "Scale",
            "finding": f"Massive Digital Identity Coverage",
            "detail": f"Total of {total_enrolments:,} new Aadhaar enrolments processed across {num_states} states/UTs and {num_districts} districts.",
            "metric": total_enrolments,
            "significance": "high"
        },
        {
            "category": "Demographics",
            "finding": "Age Group Distribution Analysis",
            "detail": f"Adults (18+) constitute the majority at {age_18_plus:,} enrolments ({round(age_18_plus/total_enrolments*100, 1) if total_enrolments > 0 else 0}%), followed by children 5-17 ({age_5_17:,}) and infants 0-5 ({age_0_5:,}).",
            "metric": {"age_0_5": age_0_5, "age_5_17": age_5_17, "age_18_plus": age_18_plus},
            "significance": "medium"
        },
        {
            "category": "Updates",
            "finding": "High Update Activity Indicates Active Usage",
            "detail": f"Demographic updates ({total_demo_updates:,}) and biometric updates ({total_bio_updates:,}) show citizens actively maintaining their Aadhaar records.",
            "metric": {"demographic": total_demo_updates, "biometric": total_bio_updates},
            "significance": "high"
        },
        {
            "category": "Regional",
            "finding": "Geographic Concentration Pattern",
            "detail": f"Top 5 states account for significant portion of enrolments, with {list(top_5_states.keys())[0]} leading.",
            "metric": top_5_states,
            "significance": "medium"
        },
        {
            "category": "Saturation",
            "finding": "Low Activity Regions Need Attention",
            "detail": f"States with lowest enrolments may indicate near-saturation or require targeted outreach: {', '.join(list(bottom_5_states.keys())[:3])}",
            "metric": bottom_5_states,
            "significance": "medium"
        }
    ]
    
    # Policy implications
    policy_implications = [
        {
            "area": "Child Welfare Programs",
            "implication": f"With {age_0_5 + age_5_17:,} children enrolled, Aadhaar can effectively support DBT for mid-day meals, scholarships, and child health programs.",
            "priority": "high"
        },
        {
            "area": "Senior Citizen Services",
            "implication": "High adult enrolment enables seamless pension disbursement and healthcare benefit delivery.",
            "priority": "high"
        },
        {
            "area": "Regional Equity",
            "implication": "Variance between states suggests need for focused enrolment drives in underserved regions.",
            "priority": "medium"
        },
        {
            "area": "Data Quality",
            "implication": f"Active biometric and demographic updates ({total_bio_updates + total_demo_updates:,} total) indicate strong citizen engagement in maintaining accurate records.",
            "priority": "medium"
        }
    ]
    
    return {
        "message": "Actionable Societal Intelligence",
        "generated_at": datetime.now().isoformat(),
        "data_period_days": date_range_days,
        "key_metrics": {
            "total_enrolments": total_enrolments,
            "total_demographic_updates": total_demo_updates,
            "total_biometric_updates": total_bio_updates,
            "states_covered": num_states,
            "districts_covered": num_districts
        },
        "insights": insights,
        "policy_implications": policy_implications,
        "comparison": {
            "before": "Simple row counts and basic aggregations",
            "after": "Interpreted findings with demographic patterns, regional analysis, and actionable policy recommendations"
        }
    }


@router.get("/forecast")
async def get_forecast() -> Dict[str, Any]:
    """
    Predict next 6 months enrolment/update volume using linear regression.
    
    Returns:
    - Forecasted values for next 6 months
    - Confidence metrics
    - Trend extrapolation
    """
    # Load data
    enrolment_df = load_enrolment_data()
    demographic_df = load_demographic_data()
    biometric_df = load_biometric_data()
    
    # Monthly aggregations
    enrolment_monthly = aggregate_by_month(enrolment_df, 'total_enrolments')
    demographic_monthly = aggregate_by_month(demographic_df, 'total_demo_updates')
    biometric_monthly = aggregate_by_month(biometric_df, 'total_bio_updates')
    
    def forecast_linear(df: pd.DataFrame, value_col: str, months_ahead: int = 6) -> Dict:
        """Simple linear regression forecast."""
        if len(df) < 2:
            return {"error": "Insufficient data for forecasting"}
        
        # Create numeric time index
        X = np.arange(len(df)).reshape(-1, 1)
        y = df[value_col].values
        
        # Fit model
        model = LinearRegression()
        model.fit(X, y)
        
        # Calculate R-squared for confidence
        y_pred_train = model.predict(X)
        ss_res = np.sum((y - y_pred_train) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        # Forecast future months
        last_month = df['year_month'].iloc[-1]
        last_date = pd.Period(last_month, freq='M').to_timestamp()
        
        future_indices = np.arange(len(df), len(df) + months_ahead).reshape(-1, 1)
        predictions = model.predict(future_indices)
        predictions = np.maximum(predictions, 0)  # Ensure non-negative
        
        # Generate future month labels
        future_months = []
        for i in range(1, months_ahead + 1):
            future_date = last_date + pd.DateOffset(months=i)
            future_months.append(future_date.strftime('%Y-%m'))
        
        forecast_data = [
            {"month": month, "predicted_value": int(val)}
            for month, val in zip(future_months, predictions)
        ]
        
        return {
            "forecast": forecast_data,
            "model_info": {
                "type": "linear_regression",
                "r_squared": round(r_squared, 3),
                "slope": round(model.coef_[0], 2),
                "intercept": round(model.intercept_, 2),
                "trend": "increasing" if model.coef_[0] > 0 else "decreasing"
            },
            "historical_avg": int(np.mean(y)),
            "forecast_avg": int(np.mean(predictions)),
            "total_forecasted": int(np.sum(predictions))
        }
    
    # Generate forecasts
    enrolment_forecast = forecast_linear(enrolment_monthly, 'total_enrolments')
    demographic_forecast = forecast_linear(demographic_monthly, 'total_demo_updates')
    biometric_forecast = forecast_linear(biometric_monthly, 'total_bio_updates')
    
    return {
        "message": "Predictive Analytics - 6 Month Forecast",
        "methodology": "Linear Regression with trend extrapolation",
        "forecasts": {
            "enrolment": enrolment_forecast,
            "demographic_updates": demographic_forecast,
            "biometric_updates": biometric_forecast
        },
        "disclaimer": "Forecasts are based on historical trends and may vary based on policy changes, seasonal factors, and external events."
    }
