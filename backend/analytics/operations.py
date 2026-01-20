"""
Operational Efficiency Analytics Module
Provides explainable calculations for operational metrics and efficiency analysis.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from collections import Counter
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_enrolment_data, load_demographic_data, load_biometric_data

router = APIRouter(prefix="/api/operations", tags=["Operational Efficiency"])


@router.get("/queue-theory")
async def queue_theory_analysis() -> Dict[str, Any]:
    """
    Queue Theory Analysis using Little's Law.
    L = λW (Average items in system = Arrival rate × Average wait time)
    """
    df = load_enrolment_data()
    
    # Aggregate daily totals
    daily_totals = df.groupby('date')['total_enrolments'].sum().reset_index()
    daily_totals = daily_totals.sort_values('date')
    
    # Calculate arrival rate (λ) - average daily arrivals
    lambda_rate = daily_totals['total_enrolments'].mean()
    
    # Estimate processing capacity based on data patterns
    max_daily = daily_totals['total_enrolments'].max()
    processing_capacity = max_daily * 1.1  # Assume 10% buffer
    
    # Calculate utilization (ρ)
    utilization = lambda_rate / processing_capacity if processing_capacity > 0 else 0
    
    # For M/M/1 queue model, calculate average wait time
    # W = 1 / (μ - λ) where μ is service rate
    if processing_capacity > lambda_rate:
        avg_wait_factor = 1 / (processing_capacity - lambda_rate)
        avg_queue_length = lambda_rate * avg_wait_factor  # L = λW
    else:
        avg_wait_factor = float('inf')
        avg_queue_length = float('inf')
    
    # Calculate queue metrics by state
    state_metrics = df.groupby('state').agg({
        'total_enrolments': ['sum', 'mean', 'max']
    }).reset_index()
    state_metrics.columns = ['state', 'total', 'daily_avg', 'peak']
    state_metrics['utilization'] = (state_metrics['daily_avg'] / state_metrics['peak']).round(3)
    
    # Identify bottlenecks (states with high utilization)
    bottlenecks = state_metrics[state_metrics['utilization'] > 0.85].sort_values('utilization', ascending=False)
    
    # Risk assessment
    if utilization > 0.9:
        risk = "HIGH"
        decision = "System operating near capacity - risk of delays and backlogs"
    elif utilization > 0.7:
        risk = "MEDIUM"
        decision = "Moderate utilization - monitor for peak period issues"
    else:
        risk = "LOW"
        decision = "System has adequate capacity for current demand"
    
    return {
        "technique": "Queue Theory (Little's Law)",
        "description": "Analyzes system throughput using queuing theory. Little's Law states L = lambda*W, connecting average queue length (L), arrival rate (lambda), and wait time (W).",
        "formula": "L = lambda*W | rho = lambda/mu | W = 1/(mu-lambda) for M/M/1 queue",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Calculate Arrival Rate (λ)",
                "description": "Average number of enrolments per day",
                "input": f"{len(daily_totals)} days of data",
                "output": f"lambda = {lambda_rate:,.0f} enrolments/day"
            },
            {
                "step": 2,
                "title": "Estimate Processing Capacity (mu)",
                "description": "Based on maximum observed throughput + 10% buffer",
                "input": f"Max daily: {max_daily:,.0f}",
                "output": f"mu = {processing_capacity:,.0f} enrolments/day"
            },
            {
                "step": 3,
                "title": "Calculate Utilization (rho)",
                "description": "rho = lambda/mu (proportion of capacity used)",
                "input": f"lambda = {lambda_rate:,.0f}, mu = {processing_capacity:,.0f}",
                "output": f"rho = {utilization:.2%}"
            },
            {
                "step": 4,
                "title": "Calculate Average Wait Factor",
                "description": "W = 1/(mu-lambda) for M/M/1 queue model",
                "input": f"mu - lambda = {processing_capacity - lambda_rate:,.0f}",
                "output": f"W factor = {avg_wait_factor:.6f}" if avg_wait_factor != float('inf') else "System overloaded"
            },
            {
                "step": 5,
                "title": "Apply Little's Law",
                "description": "L = lambda*W (Average queue length)",
                "input": f"lambda = {lambda_rate:,.0f}, W = {avg_wait_factor:.6f}" if avg_wait_factor != float('inf') else "N/A",
                "output": f"L = {avg_queue_length:,.0f}" if avg_queue_length != float('inf') else "Infinite backlog"
            }
        ],
        "intermediate_values": {
            "days_analyzed": len(daily_totals),
            "total_enrolments": int(daily_totals['total_enrolments'].sum()),
            "min_daily": int(daily_totals['total_enrolments'].min()),
            "max_daily": int(max_daily),
            "std_daily": round(daily_totals['total_enrolments'].std(), 2),
            "service_intensity": round(lambda_rate / processing_capacity, 4) if processing_capacity > 0 else 0
        },
        "final_result": {
            "arrival_rate_lambda": round(lambda_rate, 2),
            "processing_capacity_mu": round(processing_capacity, 2),
            "utilization_rho": round(utilization, 4),
            "prob_queue_p1": round(utilization ** 2, 4), # Simplified M/M/1
            "avg_wait_time_wq": round(avg_wait_factor if avg_wait_factor != float('inf') else 999, 4),
            "avg_queue_length_lq": round(avg_queue_length if avg_queue_length != float('inf') else 999, 4),
            "bottleneck_states": len(bottlenecks)
        },
        "risk_classification": risk,
        "decision": decision,
        "bottlenecks": bottlenecks.head(5).to_dict('records') if len(bottlenecks) > 0 else [],
        "visualization_data": {
            "daily_trend": {
                "dates": [d.strftime('%Y-%m-%d') for d in daily_totals['date'].tail(30)],
                "values": daily_totals['total_enrolments'].tail(30).tolist(),
                "capacity_line": processing_capacity
            },
            "utilization_gauge": round(utilization * 100, 1)
        }
    }


@router.get("/load-balance")
async def load_balance_analysis() -> Dict[str, Any]:
    """
    Load Balancing Analysis.
    Evaluates distribution of workload across states and districts.
    """
    df = load_enrolment_data()
    
    # State-level load analysis
    state_load = df.groupby('state')['total_enrolments'].sum().reset_index()
    state_load = state_load.sort_values('total_enrolments', ascending=False)
    
    total_load = state_load['total_enrolments'].sum()
    state_load['percentage'] = (state_load['total_enrolments'] / total_load * 100).round(2)
    state_load['cumulative'] = state_load['percentage'].cumsum()
    
    # Calculate load distribution metrics
    mean_load = state_load['total_enrolments'].mean()
    std_load = state_load['total_enrolments'].std()
    cv = std_load / mean_load if mean_load > 0 else 0  # Coefficient of variation
    
    # Gini coefficient for inequality
    n = len(state_load)
    sorted_loads = state_load['total_enrolments'].sort_values().values
    cumulative = np.cumsum(sorted_loads)
    gini = (2 * np.sum((np.arange(1, n+1) * sorted_loads))) / (n * np.sum(sorted_loads)) - (n + 1) / n
    
    # Identify overloaded and underloaded states
    threshold_high = mean_load * 1.5
    threshold_low = mean_load * 0.5
    
    overloaded = state_load[state_load['total_enrolments'] > threshold_high]
    underloaded = state_load[state_load['total_enrolments'] < threshold_low]
    
    # Calculate balance score (0-100, higher is more balanced)
    balance_score = max(0, 100 - (cv * 50) - (gini * 50))
    
    # Risk assessment
    if balance_score < 40:
        risk = "HIGH"
        decision = "Severe load imbalance - consider redistribution of resources"
    elif balance_score < 70:
        risk = "MEDIUM"
        decision = "Moderate imbalance - some states may need additional capacity"
    else:
        risk = "LOW"
        decision = "Load reasonably balanced across states"
    
    return {
        "technique": "Load Balancing Analysis",
        "description": "Evaluates how evenly workload is distributed across geographic regions using statistical measures of dispersion and inequality.",
        "formula": "CV = σ/μ | Gini = (2Σi×xᵢ)/(nΣxᵢ) - (n+1)/n | Balance Score = 100 - CV×50 - Gini×50",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate Load by State",
                "description": "Sum enrolments for each state",
                "input": f"{len(df):,} records",
                "output": f"{len(state_load)} states analyzed"
            },
            {
                "step": 2,
                "title": "Calculate Distribution Statistics",
                "description": "Compute mean (μ) and standard deviation (σ)",
                "input": f"Total load: {total_load:,}",
                "output": f"μ = {mean_load:,.0f}, σ = {std_load:,.0f}"
            },
            {
                "step": 3,
                "title": "Calculate Coefficient of Variation",
                "description": "CV = σ/μ (relative measure of dispersion)",
                "input": f"σ = {std_load:,.0f}, μ = {mean_load:,.0f}",
                "output": f"CV = {cv:.4f}"
            },
            {
                "step": 4,
                "title": "Calculate Gini Coefficient",
                "description": "Measure of inequality (0 = perfect equality, 1 = perfect inequality)",
                "input": f"Sorted loads for {n} states",
                "output": f"Gini = {gini:.4f}"
            },
            {
                "step": 5,
                "title": "Identify Imbalanced States",
                "description": f"Overloaded: > {threshold_high:,.0f}, Underloaded: < {threshold_low:,.0f}",
                "input": "State loads vs thresholds",
                "output": f"Overloaded: {len(overloaded)}, Underloaded: {len(underloaded)}"
            },
            {
                "step": 6,
                "title": "Calculate Balance Score",
                "description": "Combined metric from CV and Gini",
                "input": f"CV={cv:.4f}, Gini={gini:.4f}",
                "output": f"Balance Score = {balance_score:.1f}/100"
            }
        ],
        "intermediate_values": {
            "total_load": int(total_load),
            "mean_load": round(mean_load, 2),
            "std_load": round(std_load, 2),
            "coefficient_of_variation": round(cv, 4),
            "gini_coefficient": round(gini, 4)
        },
        "final_result": {
            "balance_score": round(balance_score, 2),
            "overloaded_states": len(overloaded),
            "underloaded_states": len(underloaded),
            "balanced_states": len(state_load) - len(overloaded) - len(underloaded)
        },
        "risk_classification": risk,
        "decision": decision,
        "state_distribution": state_load.head(10).to_dict('records'),
        "visualization_data": {
            "pie_chart": {
                "labels": state_load.head(8)['state'].tolist() + ['Others'],
                "values": state_load.head(8)['percentage'].tolist() + [state_load.tail(len(state_load)-8)['percentage'].sum()]
            },
            "balance_gauge": round(balance_score, 1)
        }
    }


@router.get("/throughput")
async def throughput_analysis() -> Dict[str, Any]:
    """
    Throughput Analysis.
    Measures processing rates and identifies performance trends.
    """
    df = load_enrolment_data()
    
    # Daily throughput
    daily = df.groupby('date')['total_enrolments'].sum().reset_index()
    daily = daily.sort_values('date')
    
    # Calculate throughput metrics
    current_throughput = daily['total_enrolments'].tail(7).mean()  # Last 7 days
    historical_throughput = daily['total_enrolments'].mean()
    peak_throughput = daily['total_enrolments'].max()
    
    # Calculate throughput trend
    if len(daily) >= 14:
        recent = daily['total_enrolments'].tail(7).mean()
        previous = daily['total_enrolments'].iloc[-14:-7].mean()
        trend_percent = ((recent - previous) / previous * 100) if previous > 0 else 0
    else:
        trend_percent = 0
    
    # Calculate efficiency metrics
    total_days = len(daily)
    total_processed = daily['total_enrolments'].sum()
    avg_daily_rate = total_processed / total_days if total_days > 0 else 0
    
    # Percentile analysis
    p50 = daily['total_enrolments'].quantile(0.5)
    p90 = daily['total_enrolments'].quantile(0.9)
    p99 = daily['total_enrolments'].quantile(0.99)
    
    # Identify low-performance days
    low_threshold = historical_throughput * 0.5
    low_days = daily[daily['total_enrolments'] < low_threshold]
    
    # Risk assessment
    if current_throughput < historical_throughput * 0.7:
        risk = "HIGH"
        decision = "Current throughput significantly below historical average"
    elif trend_percent < -20:
        risk = "MEDIUM"
        decision = "Declining throughput trend detected"
    else:
        risk = "LOW"
        decision = "Throughput within normal operating range"
    
    return {
        "technique": "Throughput Analysis",
        "description": "Measures system processing rates over time, identifies trends, and detects performance anomalies.",
        "formula": "Throughput = Total Processed / Time | Trend = (Recent - Previous) / Previous × 100",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate Daily Throughput",
                "description": "Calculate total enrolments processed each day",
                "input": f"{len(df):,} records",
                "output": f"{total_days} days of throughput data"
            },
            {
                "step": 2,
                "title": "Calculate Current Throughput",
                "description": "Average of last 7 days",
                "input": "Last 7 days data",
                "output": f"{current_throughput:,.0f} enrolments/day"
            },
            {
                "step": 3,
                "title": "Calculate Historical Average",
                "description": "Mean across all days",
                "input": f"{total_days} days",
                "output": f"{historical_throughput:,.0f} enrolments/day"
            },
            {
                "step": 4,
                "title": "Calculate Trend",
                "description": "Compare recent week to previous week",
                "input": "Week-over-week comparison",
                "output": f"Trend: {trend_percent:+.1f}%"
            },
            {
                "step": 5,
                "title": "Percentile Analysis",
                "description": "Calculate P50, P90, P99 throughput levels",
                "input": "Daily throughput distribution",
                "output": f"P50={p50:,.0f}, P90={p90:,.0f}, P99={p99:,.0f}"
            }
        ],
        "intermediate_values": {
            "total_days": total_days,
            "total_processed": int(total_processed),
            "min_daily": int(daily['total_enrolments'].min()),
            "max_daily": int(peak_throughput),
            "std_daily": round(daily['total_enrolments'].std(), 2)
        },
        "final_result": {
            "current_throughput": round(current_throughput, 2),
            "historical_throughput": round(historical_throughput, 2),
            "peak_throughput": int(peak_throughput),
            "trend_percent": round(trend_percent, 2),
            "low_performance_days": len(low_days)
        },
        "risk_classification": risk,
        "decision": decision,
        "visualization_data": {
            "time_series": {
                "dates": [d.strftime('%Y-%m-%d') for d in daily['date']],
                "values": daily['total_enrolments'].tolist(),
                "avg_line": historical_throughput
            },
            "percentiles": {"p50": p50, "p90": p90, "p99": p99}
        }
    }


@router.get("/yield")
async def yield_analysis() -> Dict[str, Any]:
    """
    Yield Analysis.
    Measures completion rates and success metrics across different segments.
    """
    df = load_enrolment_data()
    demo_df = load_demographic_data()
    bio_df = load_biometric_data()
    
    # Calculate totals
    total_enrol = df['total_enrolments'].sum()
    total_demo = demo_df['total_demo_updates'].sum()
    total_bio = bio_df['total_bio_updates'].sum()
    
    # Calculate yield rates (updates as percentage of enrolments)
    demo_yield = (total_demo / total_enrol * 100) if total_enrol > 0 else 0
    bio_yield = (total_bio / total_enrol * 100) if total_enrol > 0 else 0
    
    # State-level yield analysis
    state_enrol = df.groupby('state')['total_enrolments'].sum().reset_index()
    state_demo = demo_df.groupby('state')['total_demo_updates'].sum().reset_index()
    state_bio = bio_df.groupby('state')['total_bio_updates'].sum().reset_index()
    
    state_yield = state_enrol.merge(state_demo, on='state', how='left')
    state_yield = state_yield.merge(state_bio, on='state', how='left')
    state_yield = state_yield.fillna(0)
    state_yield['demo_yield'] = (state_yield['total_demo_updates'] / state_yield['total_enrolments'] * 100).round(2)
    state_yield['bio_yield'] = (state_yield['total_bio_updates'] / state_yield['total_enrolments'] * 100).round(2)
    state_yield['combined_yield'] = ((state_yield['demo_yield'] + state_yield['bio_yield']) / 2).round(2)
    
    # Identify high and low yield states
    avg_yield = state_yield['combined_yield'].mean()
    high_yield = state_yield[state_yield['combined_yield'] > avg_yield * 1.2]
    low_yield = state_yield[state_yield['combined_yield'] < avg_yield * 0.8]
    
    # Calculate overall yield score
    yield_score = min(100, (demo_yield + bio_yield) / 2)
    
    # Risk assessment
    if yield_score < 30:
        risk = "HIGH"
        decision = "Low yield rates - citizens not actively updating records"
    elif yield_score < 60:
        risk = "MEDIUM"
        decision = "Moderate yield - room for improvement in update rates"
    else:
        risk = "LOW"
        decision = "Healthy yield rates - good citizen engagement"
    
    return {
        "technique": "Yield Analysis",
        "description": "Measures the ratio of updates (demographic/biometric) to new enrolments, indicating citizen engagement and data maintenance rates.",
        "formula": "Yield Rate = (Updates / Enrolments) × 100 | Combined Yield = (Demo Yield + Bio Yield) / 2",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Calculate Total Volumes",
                "description": "Sum enrolments and updates across all records",
                "input": "Three datasets",
                "output": f"Enrolments: {total_enrol:,}, Demo: {total_demo:,}, Bio: {total_bio:,}"
            },
            {
                "step": 2,
                "title": "Calculate Demographic Yield",
                "description": "Demo Updates / Enrolments × 100",
                "input": f"{total_demo:,} / {total_enrol:,}",
                "output": f"Demo Yield = {demo_yield:.2f}%"
            },
            {
                "step": 3,
                "title": "Calculate Biometric Yield",
                "description": "Bio Updates / Enrolments × 100",
                "input": f"{total_bio:,} / {total_enrol:,}",
                "output": f"Bio Yield = {bio_yield:.2f}%"
            },
            {
                "step": 4,
                "title": "State-Level Analysis",
                "description": "Calculate yield for each state",
                "input": f"{len(state_yield)} states",
                "output": f"High yield: {len(high_yield)}, Low yield: {len(low_yield)}"
            },
            {
                "step": 5,
                "title": "Calculate Overall Score",
                "description": "Combined average of both yield rates",
                "input": f"Demo={demo_yield:.2f}%, Bio={bio_yield:.2f}%",
                "output": f"Yield Score = {yield_score:.2f}"
            }
        ],
        "intermediate_values": {
            "total_enrolments": int(total_enrol),
            "total_demo_updates": int(total_demo),
            "total_bio_updates": int(total_bio),
            "avg_state_yield": round(avg_yield, 2)
        },
        "final_result": {
            "demo_yield_percent": round(demo_yield, 2),
            "bio_yield_percent": round(bio_yield, 2),
            "yield_score": round(yield_score, 2),
            "high_yield_states": len(high_yield),
            "low_yield_states": len(low_yield)
        },
        "risk_classification": risk,
        "decision": decision,
        "state_breakdown": state_yield.sort_values('combined_yield', ascending=False).head(10).to_dict('records'),
        "visualization_data": {
            "comparison_bar": {
                "labels": ["Enrolments", "Demo Updates", "Bio Updates"],
                "values": [int(total_enrol), int(total_demo), int(total_bio)]
            },
            "yield_percentages": {
                "demo": round(demo_yield, 1),
                "bio": round(bio_yield, 1)
            }
        }
    }


@router.get("/pareto")
async def pareto_analysis() -> Dict[str, Any]:
    """
    Pareto Analysis (80/20 Rule).
    Identifies the vital few contributors to overall volume.
    """
    df = load_enrolment_data()
    
    # State-level Pareto
    state_totals = df.groupby('state')['total_enrolments'].sum().reset_index()
    state_totals = state_totals.sort_values('total_enrolments', ascending=False)
    
    total = state_totals['total_enrolments'].sum()
    state_totals['percentage'] = (state_totals['total_enrolments'] / total * 100).round(2)
    state_totals['cumulative'] = state_totals['percentage'].cumsum().round(2)
    
    # Find the 80% threshold
    states_for_80 = len(state_totals[state_totals['cumulative'] <= 80]) + 1
    percentage_of_states = (states_for_80 / len(state_totals) * 100)
    
    # District-level Pareto
    district_totals = df.groupby(['state', 'district'])['total_enrolments'].sum().reset_index()
    district_totals = district_totals.sort_values('total_enrolments', ascending=False)
    district_totals['percentage'] = (district_totals['total_enrolments'] / total * 100).round(4)
    district_totals['cumulative'] = district_totals['percentage'].cumsum().round(2)
    
    districts_for_80 = len(district_totals[district_totals['cumulative'] <= 80]) + 1
    percentage_of_districts = (districts_for_80 / len(district_totals) * 100)
    
    # Pareto ratio
    pareto_ratio_states = 80 / percentage_of_states if percentage_of_states > 0 else 0
    pareto_ratio_districts = 80 / percentage_of_districts if percentage_of_districts > 0 else 0
    
    # Identify vital few
    vital_states = state_totals[state_totals['cumulative'] <= 80]['state'].tolist()
    
    # Risk assessment (concentration risk)
    if percentage_of_states < 15:
        risk = "HIGH"
        decision = "Extreme concentration - few states dominate volume"
    elif percentage_of_states < 30:
        risk = "MEDIUM"
        decision = "Moderate concentration - consider diversification"
    else:
        risk = "LOW"
        decision = "Healthy distribution across states"
    
    return {
        "technique": "Pareto Analysis (80/20 Rule)",
        "description": "Identifies the 'vital few' contributors that account for the majority of outcomes. The classic 80/20 rule suggests 80% of effects come from 20% of causes.",
        "formula": "Pareto Ratio = 80% / (% of items contributing 80%) | Higher ratio = more concentration",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate by State",
                "description": "Calculate total enrolments per state",
                "input": f"{len(df):,} records",
                "output": f"{len(state_totals)} states with {total:,} total"
            },
            {
                "step": 2,
                "title": "Sort by Contribution",
                "description": "Order states from highest to lowest volume",
                "input": "State totals",
                "output": f"Top state: {state_totals.iloc[0]['state']} ({state_totals.iloc[0]['percentage']:.1f}%)"
            },
            {
                "step": 3,
                "title": "Calculate Cumulative Percentage",
                "description": "Running total of contribution percentages",
                "input": "Sorted percentages",
                "output": "Cumulative distribution calculated"
            },
            {
                "step": 4,
                "title": "Find 80% Threshold (States)",
                "description": "Count states needed to reach 80% of volume",
                "input": "Cumulative percentages",
                "output": f"{states_for_80} states = 80% ({percentage_of_states:.1f}% of total states)"
            },
            {
                "step": 5,
                "title": "Find 80% Threshold (Districts)",
                "description": "Count districts needed to reach 80% of volume",
                "input": f"{len(district_totals)} districts",
                "output": f"{districts_for_80} districts = 80% ({percentage_of_districts:.1f}%)"
            },
            {
                "step": 6,
                "title": "Calculate Pareto Ratio",
                "description": "Measure of concentration (ideal 80/20 = 4.0)",
                "input": "80% / contributor percentage",
                "output": f"States: {pareto_ratio_states:.2f}, Districts: {pareto_ratio_districts:.2f}"
            }
        ],
        "intermediate_values": {
            "total_states": len(state_totals),
            "total_districts": len(district_totals),
            "total_volume": int(total),
            "top_5_states_share": round(state_totals.head(5)['percentage'].sum(), 2)
        },
        "final_result": {
            "states_for_80_percent": states_for_80,
            "state_percentage": round(percentage_of_states, 2),
            "districts_for_80_percent": districts_for_80,
            "district_percentage": round(percentage_of_districts, 2),
            "pareto_ratio_states": round(pareto_ratio_states, 2),
            "pareto_ratio_districts": round(pareto_ratio_districts, 2)
        },
        "risk_classification": risk,
        "decision": decision,
        "vital_few_states": vital_states[:10],
        "visualization_data": {
            "pareto_chart": {
                "labels": state_totals['state'].tolist(),
                "values": state_totals['total_enrolments'].tolist(),
                "cumulative": state_totals['cumulative'].tolist()
            },
            "threshold_line": 80
        }
    }
