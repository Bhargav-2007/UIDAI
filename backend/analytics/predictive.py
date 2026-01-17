"""
Predictive Intelligence Analytics Module
Provides explainable calculations for forecasting and predictive analysis.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_enrolment_data, load_demographic_data, aggregate_by_month

router = APIRouter(prefix="/api/predictive", tags=["Predictive Intelligence"])


@router.get("/forecast")
async def time_series_forecast() -> Dict[str, Any]:
    """
    Time Series Forecasting with trend decomposition.
    Uses linear regression with trend and seasonality components.
    """
    df = load_enrolment_data()
    
    # Monthly aggregation
    monthly = aggregate_by_month(df, 'total_enrolments')
    monthly['month_num'] = range(len(monthly))
    
    values = monthly['total_enrolments'].values
    X = np.arange(len(values)).reshape(-1, 1)
    y = values
    
    # Step 1: Fit linear trend
    trend_model = LinearRegression()
    trend_model.fit(X, y)
    trend = trend_model.predict(X)
    
    # Step 2: Calculate residuals (detrended data)
    residuals = y - trend
    
    # Step 3: Calculate seasonality (if enough data)
    if len(monthly) >= 12:
        seasonal = np.zeros(12)
        for i in range(12):
            month_residuals = residuals[i::12]
            if len(month_residuals) > 0:
                seasonal[i] = np.mean(month_residuals)
    else:
        seasonal = np.zeros(12)
    
    # Step 4: Calculate R-squared
    y_pred = trend_model.predict(X)
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    # Step 5: Forecast next 6 months
    forecast_months = 6
    last_month = len(values)
    future_X = np.arange(last_month, last_month + forecast_months).reshape(-1, 1)
    
    forecast_trend = trend_model.predict(future_X)
    forecast_seasonal = [seasonal[i % 12] for i in range(last_month, last_month + forecast_months)]
    forecast_values = forecast_trend + forecast_seasonal
    forecast_values = np.maximum(forecast_values, 0)  # Ensure non-negative
    
    # Generate future month labels
    last_period = pd.Period(monthly['year_month'].iloc[-1], freq='M')
    future_months = [(last_period + i + 1).strftime('%Y-%m') for i in range(forecast_months)]
    
    # Calculate confidence interval (simplified)
    std_residual = np.std(residuals)
    ci_upper = forecast_values + 1.96 * std_residual
    ci_lower = np.maximum(0, forecast_values - 1.96 * std_residual)
    
    # Risk assessment
    trend_direction = "increasing" if trend_model.coef_[0] > 0 else "decreasing"
    if trend_direction == "decreasing" and abs(trend_model.coef_[0]) > np.mean(y) * 0.1:
        risk = "HIGH"
        decision = "Significant declining trend - investigate root causes"
    elif r_squared < 0.5:
        risk = "MEDIUM"
        decision = "Low model fit - forecast reliability limited"
    else:
        risk = "LOW"
        decision = "Reliable trend model for forecasting"
    
    return {
        "technique": "Time Series Forecasting",
        "description": "Decomposes time series into trend and seasonal components, then projects future values using linear regression.",
        "formula": "Y = Trend + Seasonal + Residual | Trend = α + βt | Forecast = Trend(t+h) + Seasonal(t+h)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate Monthly Data",
                "description": "Convert daily data to monthly totals",
                "input": f"{len(df):,} daily records",
                "output": f"{len(monthly)} months of data"
            },
            {
                "step": 2,
                "title": "Fit Linear Trend",
                "description": "y = α + βt using ordinary least squares",
                "input": f"t = 0 to {len(monthly)-1}",
                "output": f"α = {trend_model.intercept_:,.0f}, β = {trend_model.coef_[0]:,.2f}"
            },
            {
                "step": 3,
                "title": "Extract Seasonality",
                "description": "Calculate average residual for each calendar month",
                "input": "Detrended residuals",
                "output": f"Seasonal factors for {min(12, len(set(range(len(monthly)) % 12)))} months"
            },
            {
                "step": 4,
                "title": "Calculate Model Fit (R²)",
                "description": "R² = 1 - (SS_residual / SS_total)",
                "input": f"SS_res = {ss_res:,.0f}, SS_tot = {ss_tot:,.0f}",
                "output": f"R² = {r_squared:.4f}"
            },
            {
                "step": 5,
                "title": "Generate Forecast",
                "description": "Project trend and add seasonal component",
                "input": f"Months {last_month} to {last_month + forecast_months - 1}",
                "output": f"Forecasted {forecast_months} months"
            },
            {
                "step": 6,
                "title": "Calculate Confidence Interval",
                "description": "95% CI using residual standard deviation",
                "input": f"σ_residual = {std_residual:,.0f}",
                "output": f"±{1.96 * std_residual:,.0f}"
            }
        ],
        "intermediate_values": {
            "trend_intercept": round(float(trend_model.intercept_), 2),
            "trend_slope": round(float(trend_model.coef_[0]), 2),
            "trend_direction": trend_direction,
            "seasonal_factors": [round(s, 2) for s in seasonal.tolist()],
            "residual_std": round(float(std_residual), 2)
        },
        "final_result": {
            "r_squared": round(r_squared, 4),
            "months_analyzed": len(monthly),
            "forecast_total": int(np.sum(forecast_values)),
            "forecast_avg": int(np.mean(forecast_values))
        },
        "risk_classification": risk,
        "decision": decision,
        "forecast": [
            {
                "month": month,
                "predicted": int(val),
                "ci_lower": int(lower),
                "ci_upper": int(upper)
            }
            for month, val, lower, upper in zip(future_months, forecast_values, ci_lower, ci_upper)
        ],
        "visualization_data": {
            "historical": {
                "months": monthly['year_month'].tolist(),
                "values": [int(v) for v in values],
                "trend": [int(t) for t in trend]
            },
            "forecast": {
                "months": future_months,
                "values": [int(v) for v in forecast_values],
                "ci_lower": [int(v) for v in ci_lower],
                "ci_upper": [int(v) for v in ci_upper]
            }
        }
    }


@router.get("/regression")
async def regression_analysis() -> Dict[str, Any]:
    """
    Multi-variable Regression Analysis.
    Analyzes relationships between different age groups and updates.
    """
    df = load_enrolment_data()
    
    # Prepare features
    feature_cols = []
    if 'age_0_5' in df.columns:
        feature_cols.append('age_0_5')
    if 'age_5_17' in df.columns:
        feature_cols.append('age_5_17')
    if 'age_18_greater' in df.columns:
        feature_cols.append('age_18_greater')
    
    if len(feature_cols) < 2:
        return {"error": "Insufficient feature columns for regression analysis"}
    
    # Aggregate by state for cleaner analysis
    state_agg = df.groupby('state')[feature_cols + ['total_enrolments']].sum().reset_index()
    
    X = state_agg[feature_cols].values
    y = state_agg['total_enrolments'].values
    
    # Fit linear regression
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate predictions and metrics
    y_pred = model.predict(X)
    
    # R-squared
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    # Adjusted R-squared
    n = len(y)
    p = len(feature_cols)
    adj_r_squared = 1 - (1 - r_squared) * (n - 1) / (n - p - 1) if n > p + 1 else r_squared
    
    # Coefficient analysis
    coefficients = dict(zip(feature_cols, model.coef_))
    
    # Feature importance (standardized coefficients)
    X_std = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-10)
    model_std = LinearRegression()
    model_std.fit(X_std, y)
    importance = dict(zip(feature_cols, np.abs(model_std.coef_)))
    total_importance = sum(importance.values())
    importance_pct = {k: round(v/total_importance*100, 2) for k, v in importance.items()}
    
    # Residual analysis
    residuals = y - y_pred
    residual_stats = {
        "mean": round(float(np.mean(residuals)), 2),
        "std": round(float(np.std(residuals)), 2),
        "max_positive": round(float(np.max(residuals)), 2),
        "max_negative": round(float(np.min(residuals)), 2)
    }
    
    # Identify outliers in predictions
    z_residuals = (residuals - np.mean(residuals)) / np.std(residuals) if np.std(residuals) > 0 else np.zeros_like(residuals)
    outlier_mask = np.abs(z_residuals) > 2
    outlier_states = state_agg.loc[outlier_mask, 'state'].tolist()
    
    # Risk assessment
    if r_squared > 0.8:
        risk = "LOW"
        decision = "Strong predictive relationship - model reliable for estimation"
    elif r_squared > 0.5:
        risk = "MEDIUM"
        decision = "Moderate relationship - use with caution"
    else:
        risk = "HIGH"
        decision = "Weak relationship - additional factors needed"
    
    return {
        "technique": "Multi-Variable Regression Analysis",
        "description": "Analyzes the relationship between input variables (age groups) and outcome (total enrolments) using ordinary least squares regression.",
        "formula": "y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε | R² = 1 - (SS_res / SS_tot)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Prepare Feature Matrix",
                "description": "Select and aggregate independent variables by state",
                "input": f"Features: {feature_cols}",
                "output": f"Matrix shape: {state_agg.shape[0]} states × {len(feature_cols)} features"
            },
            {
                "step": 2,
                "title": "Fit OLS Regression",
                "description": "Minimize sum of squared residuals",
                "input": "X (features) and y (total enrolments)",
                "output": f"Intercept: {model.intercept_:,.2f}"
            },
            {
                "step": 3,
                "title": "Calculate Coefficients",
                "description": "β values for each feature",
                "input": "Model parameters",
                "output": {col: f"{coef:.4f}" for col, coef in coefficients.items()}
            },
            {
                "step": 4,
                "title": "Calculate R-Squared",
                "description": "Proportion of variance explained",
                "input": f"SS_res = {ss_res:,.0f}, SS_tot = {ss_tot:,.0f}",
                "output": f"R² = {r_squared:.4f}, Adj R² = {adj_r_squared:.4f}"
            },
            {
                "step": 5,
                "title": "Feature Importance",
                "description": "Standardized coefficient magnitudes",
                "input": "Standardized features",
                "output": importance_pct
            },
            {
                "step": 6,
                "title": "Residual Analysis",
                "description": "Check prediction errors for outliers",
                "input": "Predicted vs Actual values",
                "output": f"Outlier states: {len(outlier_states)}"
            }
        ],
        "intermediate_values": {
            "sample_size": n,
            "num_features": p,
            "intercept": round(float(model.intercept_), 2),
            "coefficients": {k: round(float(v), 4) for k, v in coefficients.items()},
            "residual_stats": residual_stats
        },
        "final_result": {
            "r_squared": round(r_squared, 4),
            "adjusted_r_squared": round(adj_r_squared, 4),
            "feature_importance_pct": importance_pct,
            "outlier_states": len(outlier_states)
        },
        "risk_classification": risk,
        "decision": decision,
        "outlier_states": outlier_states[:5],
        "visualization_data": {
            "actual_vs_predicted": {
                "actual": [int(v) for v in y[:20]],
                "predicted": [int(v) for v in y_pred[:20]],
                "states": state_agg['state'].tolist()[:20]
            },
            "feature_importance": {
                "labels": list(importance_pct.keys()),
                "values": list(importance_pct.values())
            }
        }
    }


@router.get("/scenarios")
async def scenario_planning() -> Dict[str, Any]:
    """
    Scenario Planning Analysis.
    Projects outcomes under different growth assumptions.
    """
    df = load_enrolment_data()
    
    # Calculate current baseline
    monthly = aggregate_by_month(df, 'total_enrolments')
    current_monthly = monthly['total_enrolments'].tail(3).mean()
    total_current = monthly['total_enrolments'].sum()
    
    # Historical growth rate
    if len(monthly) >= 2:
        growth_rates = monthly['total_enrolments'].pct_change().dropna()
        avg_growth = growth_rates.mean()
        growth_std = growth_rates.std()
    else:
        avg_growth = 0
        growth_std = 0.1
    
    # Define scenarios
    months_ahead = 12
    scenarios = {
        "pessimistic": {
            "growth_rate": avg_growth - growth_std,
            "description": "Conservative estimate with below-average growth"
        },
        "baseline": {
            "growth_rate": avg_growth,
            "description": "Continuation of historical average growth"
        },
        "optimistic": {
            "growth_rate": avg_growth + growth_std,
            "description": "Accelerated growth scenario"
        },
        "aggressive": {
            "growth_rate": avg_growth + 2 * growth_std,
            "description": "Maximum expansion scenario"
        }
    }
    
    # Project each scenario
    projections = {}
    for name, scenario in scenarios.items():
        monthly_rate = 1 + scenario['growth_rate']
        projection = []
        value = current_monthly
        for month in range(1, months_ahead + 1):
            value = value * monthly_rate
            projection.append({
                "month": month,
                "projected_value": int(max(0, value))
            })
        
        total_projected = sum(p['projected_value'] for p in projection)
        projections[name] = {
            "growth_rate": round(scenario['growth_rate'] * 100, 2),
            "description": scenario['description'],
            "projections": projection,
            "total_projected": total_projected,
            "change_from_baseline": round((total_projected / (current_monthly * months_ahead) - 1) * 100, 2)
        }
    
    # Calculate scenario comparison
    baseline_total = projections['baseline']['total_projected']
    scenario_variance = {
        name: round((proj['total_projected'] - baseline_total) / baseline_total * 100, 2)
        for name, proj in projections.items()
    }
    
    # Risk assessment
    if growth_std > abs(avg_growth) * 2:
        risk = "HIGH"
        decision = "High volatility - wide range between scenarios"
    elif growth_std > abs(avg_growth):
        risk = "MEDIUM"
        decision = "Moderate uncertainty in projections"
    else:
        risk = "LOW"
        decision = "Stable growth pattern - scenarios converge"
    
    return {
        "technique": "Scenario Planning",
        "description": "Projects future outcomes under different growth assumptions based on historical volatility. Helps decision-makers prepare for multiple possible futures.",
        "formula": "Projected(t) = Current × (1 + growth_rate)^t | Scenarios: μ±σ, μ±2σ",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Calculate Baseline",
                "description": "Average of last 3 months as starting point",
                "input": "Last 3 months data",
                "output": f"Baseline: {current_monthly:,.0f}/month"
            },
            {
                "step": 2,
                "title": "Calculate Historical Growth",
                "description": "Monthly percentage changes over history",
                "input": f"{len(monthly)} months of data",
                "output": f"Avg growth: {avg_growth*100:.2f}%, Std: {growth_std*100:.2f}%"
            },
            {
                "step": 3,
                "title": "Define Scenarios",
                "description": "Create growth assumptions at μ, μ±σ, μ+2σ",
                "input": "Historical statistics",
                "output": f"4 scenarios defined"
            },
            {
                "step": 4,
                "title": "Project Each Scenario",
                "description": "Compound growth for 12 months",
                "input": f"Base: {current_monthly:,.0f}",
                "output": {name: f"+{proj['change_from_baseline']:.1f}%" for name, proj in projections.items()}
            },
            {
                "step": 5,
                "title": "Calculate Variance",
                "description": "Difference from baseline scenario",
                "input": f"Baseline total: {baseline_total:,}",
                "output": scenario_variance
            }
        ],
        "intermediate_values": {
            "current_monthly_avg": round(current_monthly, 2),
            "historical_avg_growth": round(avg_growth * 100, 2),
            "growth_std_dev": round(growth_std * 100, 2),
            "months_ahead": months_ahead
        },
        "final_result": {
            "baseline_12month_total": projections['baseline']['total_projected'],
            "optimistic_12month_total": projections['optimistic']['total_projected'],
            "pessimistic_12month_total": projections['pessimistic']['total_projected'],
            "scenario_variance_percent": scenario_variance
        },
        "risk_classification": risk,
        "decision": decision,
        "scenarios": projections,
        "visualization_data": {
            "scenario_lines": {
                "months": list(range(1, months_ahead + 1)),
                "pessimistic": [p['projected_value'] for p in projections['pessimistic']['projections']],
                "baseline": [p['projected_value'] for p in projections['baseline']['projections']],
                "optimistic": [p['projected_value'] for p in projections['optimistic']['projections']],
                "aggressive": [p['projected_value'] for p in projections['aggressive']['projections']]
            }
        }
    }


@router.get("/survival")
async def survival_analysis() -> Dict[str, Any]:
    """
    Survival/Duration Analysis.
    Analyzes time-to-event patterns for understanding update cycles.
    """
    df = load_enrolment_data()
    demo_df = load_demographic_data()
    
    # Calculate update frequencies by district over time
    daily_enrol = df.groupby(['date', 'state']).size().reset_index(name='enrol_records')
    daily_demo = demo_df.groupby(['date', 'state']).size().reset_index(name='demo_records')
    
    # Merge to find update patterns
    merged = daily_enrol.merge(daily_demo, on=['date', 'state'], how='outer').fillna(0)
    merged['has_update'] = merged['demo_records'] > 0
    
    # Calculate "time to first update" concept per state
    state_first_update = merged.groupby('state').apply(
        lambda x: (x[x['has_update']]['date'].min() - x['date'].min()).days 
        if x['has_update'].any() else -1
    ).reset_index()
    state_first_update.columns = ['state', 'days_to_first_update']
    state_first_update = state_first_update[state_first_update['days_to_first_update'] >= 0]
    
    if len(state_first_update) > 0:
        # Survival function calculation
        durations = state_first_update['days_to_first_update'].values
        
        # Create survival table
        unique_times = np.sort(np.unique(durations))
        n_at_risk = []
        n_events = []
        survival_prob = []
        
        current_survival = 1.0
        n_total = len(durations)
        
        for t in unique_times:
            n_at_risk_t = np.sum(durations >= t)
            n_events_t = np.sum(durations == t)
            
            hazard = n_events_t / n_at_risk_t if n_at_risk_t > 0 else 0
            current_survival *= (1 - hazard)
            
            n_at_risk.append(n_at_risk_t)
            n_events.append(n_events_t)
            survival_prob.append(current_survival)
        
        # Calculate median survival time
        if len(survival_prob) > 0:
            median_idx = np.argmax(np.array(survival_prob) <= 0.5)
            median_survival = unique_times[median_idx] if median_idx > 0 else unique_times[-1]
        else:
            median_survival = 0
        
        # Calculate hazard rates
        mean_duration = np.mean(durations)
        std_duration = np.std(durations)
    else:
        unique_times = np.array([0])
        survival_prob = [1.0]
        n_at_risk = [0]
        n_events = [0]
        median_survival = 0
        mean_duration = 0
        std_duration = 0
    
    # Risk assessment
    if median_survival > 30:
        risk = "HIGH"
        decision = "Long time to updates - citizen engagement may be low"
    elif median_survival > 14:
        risk = "MEDIUM"
        decision = "Moderate update cycle - consider awareness campaigns"
    else:
        risk = "LOW"
        decision = "Quick update adoption - healthy engagement pattern"
    
    return {
        "technique": "Survival Analysis",
        "description": "Analyzes time-to-event patterns, specifically how long it takes for regions to start processing updates after enrolments begin. Uses Kaplan-Meier survival estimation.",
        "formula": "S(t) = Π(1 - dᵢ/nᵢ) for all tᵢ ≤ t | Hazard h(t) = d(t)/n(t)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Extract Event Times",
                "description": "Calculate days between first enrolment and first update per state",
                "input": f"Enrolment and demographic update data",
                "output": f"{len(state_first_update) if len(state_first_update) > 0 else 0} states with complete data"
            },
            {
                "step": 2,
                "title": "Build Survival Table",
                "description": "Count at-risk population and events at each time point",
                "input": f"Duration values",
                "output": f"{len(unique_times)} unique time points"
            },
            {
                "step": 3,
                "title": "Calculate Survival Probabilities",
                "description": "S(t) = Π(1 - deaths/at_risk) cumulative product",
                "input": "Hazard rates at each time",
                "output": f"Final S(t) = {survival_prob[-1]:.3f}" if survival_prob else "N/A"
            },
            {
                "step": 4,
                "title": "Find Median Survival",
                "description": "Time at which S(t) = 0.5",
                "input": "Survival curve",
                "output": f"Median = {median_survival} days"
            },
            {
                "step": 5,
                "title": "Calculate Summary Statistics",
                "description": "Mean and standard deviation of durations",
                "input": "All durations",
                "output": f"Mean = {mean_duration:.1f} days, SD = {std_duration:.1f} days"
            }
        ],
        "intermediate_values": {
            "states_analyzed": len(state_first_update) if len(state_first_update) > 0 else 0,
            "time_points": len(unique_times),
            "events_observed": int(np.sum(n_events)),
            "censored": 0  # Simplified - no censoring in this analysis
        },
        "final_result": {
            "median_survival_days": int(median_survival),
            "mean_duration_days": round(mean_duration, 2),
            "std_duration_days": round(std_duration, 2),
            "initial_survival_rate": 1.0,
            "final_survival_rate": round(survival_prob[-1] if survival_prob else 1.0, 3)
        },
        "risk_classification": risk,
        "decision": decision,
        "visualization_data": {
            "survival_curve": {
                "times": [int(t) for t in unique_times],
                "survival": [round(s, 4) for s in survival_prob],
                "at_risk": n_at_risk
            },
            "median_line": int(median_survival)
        }
    }
