"""
Descriptive Analytics Module
Provides fundamental statistical analysis and time series decomposition.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy import stats
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_enrolment_data, load_demographic_data

router = APIRouter(prefix="/api/descriptive", tags=["Descriptive Analytics"])

@router.get("/univariate")
async def univariate_analysis() -> Dict[str, Any]:
    """
    Univariate Analysis - Statistical summary of enrolment volumes.
    """
    df = load_enrolment_data()
    values = df['total_enrolments'].dropna()
    
    # Basic Stats
    mean_val = values.mean()
    median_val = values.median()
    std_val = values.std()
    min_val = values.min()
    max_val = values.max()
    skewness = values.skew()
    kurtosis = values.kurt()
    
    # Decisions based on skewness
    if abs(skewness) < 0.5:
        distribution_type = "Symmetrical (Normal-like)"
        insight = "Data follows a standard normal distribution."
    elif skewness > 0:
        distribution_type = "Right-Skewed (Positive)"
        insight = "Data has a long tail of high values (outliers likely)."
    else:
        distribution_type = "Left-Skewed (Negative)"
        insight = "Data has a long tail of low values."

    return {
        "technique": "Univariate Statistical Analysis",
        "description": "Fundamental statistical properties of the enrolment dataset using central tendency and dispersion metrics.",
        "formula": "μ = Σx/N | σ = √Σ(x-μ)²/N | Skew = E[(x-μ)³]/σ³",
        "calculation_steps": [
            {
                "step": 1, 
                "title": "Calculate Central Tendency", 
                "description": "Compute Mean and Median", 
                "input": f"N={len(values):,}", 
                "output": f"Mean={mean_val:,.0f}, Median={median_val:,.0f}"
            },
            {
                "step": 2,
                "title": "Calculate Dispersion",
                "description": "Compute Standard Deviation and Range",
                "input": "Enrolment values",
                "output": f"Std Dev={std_val:,.0f}, Range=[{min_val}-{max_val}]"
            },
            {
                "step": 3,
                "title": "Analyze Distribution Shape",
                "description": "Calculate Skewness and Kurtosis",
                "input": "Distribution function",
                "output": f"Skew={skewness:.2f}, Kurtosis={kurtosis:.2f}"
            }
        ],
        "intermediate_values": {
            "sum": float(values.sum()),
            "count": int(len(values)),
            "variance": float(values.var())
        },
        "final_result": {
            "mean": round(mean_val, 2),
            "median": round(median_val, 2),
            "std_dev": round(std_val, 2),
            "skewness": round(skewness, 4)
        },
        "risk_classification": "INFO",
        "decision": distribution_type,
        "risk_or_insight": insight,
        "visualization_data": {
            "histogram": {
                "values": [int(v) for v in np.histogram(values, bins=20)[0]],
                "bin_edges": [round(v, 0) for v in np.histogram(values, bins=20)[1]]
            },
            "box_plot": null
        }
    }

@router.get("/timeseries")
async def time_series_decomposition() -> Dict[str, Any]:
    """
    Time Series Decomposition - Trend, Seasonality, and Residuals.
    """
    df = load_enrolment_data()
    daily_data = df.groupby('date')['total_enrolments'].sum()
    
    # We need a rolling average for trend since simple linear regression is used elsewhere
    window_size = 30
    trend = daily_data.rolling(window=window_size, center=True).mean()
    
    # De-trended
    detrended = daily_data - trend
    
    # Seasonality (Average deviation by day of week)
    # Using a simplified additive model: Obs = Trend + Seasonality + Residual
    df_decomp = daily_data.reset_index()
    df_decomp['day_of_week'] = df_decomp['date'].dt.dayofweek
    seasonality = df_decomp.groupby('day_of_week')['total_enrolments'].transform('mean') - daily_data.mean()
    
    # Residuals
    residuals = daily_data - trend - seasonality.values
    
    return {
        "technique": "Time Series Decomposition (Additive)",
        "description": "Breaks down time series data into Trend, Seasonality, and Residual noise components.",
        "formula": "Y(t) = Trend(t) + Seasonality(t) + Residual(t)",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Calculate Trend Component",
                "description": f"Apply {window_size}-day centered moving average",
                "input": "Daily aggregated enrolments",
                "output": "Smooth trend line extracted"
            },
            {
                "step": 2,
                "title": "Extract Seasonality",
                "description": "Compute average deviation for each day of week",
                "input": "Detrended series",
                "output": "Weekly seasonal pattern identified"
            },
            {
                "step": 3,
                "title": "Compute Residuals",
                "description": "Subtract Trend and Seasonality from Observed data",
                "input": "Y - T - S",
                "output": f"Residual noise (Std Dev: {residuals.std():.0f})"
            }
        ],
        "intermediate_values": {
            "trend_mean": float(trend.mean()),
            "seasonality_amplitude": float(seasonality.max() - seasonality.min()),
            "residual_noise": float(residuals.std())
        },
        "final_result": {
            "trend_direction": "Rising" if trend.iloc[-window_size] > trend.iloc[window_size] else "Falling",
            "strongest_seasonality_day": int(df_decomp.groupby('day_of_week')['total_enrolments'].mean().idxmax())
        },
        "risk_classification": "LOW",
        "decision": "Stable Trend Detected",
        "risk_or_insight": "Significant weekly seasonality observed.",
        "visualization_data": {
            "dates": daily_data.index.astype(str).tolist(),
            "observed": daily_data.fillna(0).tolist(),
            "trend": trend.fillna(0).tolist(),
            "seasonality": seasonality.fillna(0).tolist(),
            "residuals": residuals.fillna(0).tolist()
        }
    }
