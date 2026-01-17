"""
Comparative & Quality Analytics Module
Provides benchmarking, decile analysis, and quality assessments.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_enrolment_data

router = APIRouter(prefix="/api/quality", tags=["Comparative & Quality"])

@router.get("/benchmarking")
async def peer_benchmarking() -> Dict[str, Any]:
    """
    Peer Benchmarking - Compares state performance against national averages.
    """
    df = load_enrolment_data()
    state_perf = df.groupby('state')['total_enrolments'].sum().sort_values(ascending=False)
    national_avg = state_perf.mean()
    
    # Calculate Z-Scores for ranking
    z_scores = (state_perf - national_avg) / state_perf.std()
    
    top_performers = state_perf.head(5)
    bottom_performers = state_perf.tail(5)
    
    return {
        "technique": "Peer Benchmarking (State vs National)",
        "description": "Evaluates each state's performance relative to the national average using standardized scores.",
        "formula": "Performance Index = (State Volume - National Avg) / National Std Dev",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Aggregate State Volumes",
                "description": "Sum total enrolments per state",
                "input": f"{len(df):,} records",
                "output": f"{len(state_perf)} states aggregated"
            },
            {
                "step": 2,
                "title": "Calculate National Average",
                "description": "Compute mean enrolment across all states",
                "input": "State totals",
                "output": f"National Mean = {national_avg:,.0f}"
            },
            {
                "step": 3,
                "title": "Compute Performance Index (Z-Score)",
                "description": "Normalize state performance",
                "input": "State totals vs National Mean",
                "output": "Z-scores calculated for ranking"
            }
        ],
        "intermediate_values": {
            "national_mean": round(national_avg, 2),
            "national_std": round(state_perf.std(), 2)
        },
        "final_result": {
            "top_state": state_perf.index[0],
            "bottom_state": state_perf.index[-1],
            "spread": float(state_perf.max() - state_perf.min())
        },
        "risk_classification": "INFO",
        "decision": "Benchmarking Complete",
        "risk_or_insight": f"Top performer {state_perf.index[0]} is {(state_perf.iloc[0]/national_avg):.1f}x above average.",
        "visualization_data": {
            "labels": state_perf.index.tolist(),
            "values": state_perf.values.tolist(),
            "average_line": national_avg
        }
    }

@router.get("/deciles")
async def decile_analysis() -> Dict[str, Any]:
    """
    Decile Analysis - Segments performance into 10% buckets.
    """
    df = load_enrolment_data()
    district_perf = df.groupby('district')['total_enrolments'].sum().reset_index()
    
    # Create Deciles
    district_perf['decile'] = pd.qcut(district_perf['total_enrolments'], 10, labels=False) + 1
    
    decile_stats = district_perf.groupby('decile')['total_enrolments'].agg(['sum', 'mean', 'count', 'min', 'max'])
    
    # Pareto check: Do top 2 deciles contribute > 50%?
    top_2_share = decile_stats.loc[9:10, 'sum'].sum() / district_perf['total_enrolments'].sum()
    
    return {
        "technique": "Decile Segmentation Analysis",
        "description": "Groups districts into 10 equal-sized buckets based on performance to analyze concentration.",
        "formula": "Decile = rank(x) / N * 10",
        "calculation_steps": [
            {
                "step": 1,
                "title": "Rank Districts",
                "description": "Sort all districts by total enrolment volume",
                "input": f"{len(district_perf)} districts",
                "output": "Districts ranked 1 to N"
            },
            {
                "step": 2,
                "title": "Create 10 Buckets",
                "description": "Divide ranked list into 10 equal groups",
                "input": "Ranked districts",
                "output": "10 Decile groups created"
            },
            {
                "step": 3,
                "title": "Analyze Concentration",
                "description": "Sum volumes per decile",
                "input": "Decile groups",
                "output": f"Top 20% hold {top_2_share:.1%} of volume"
            }
        ],
        "intermediate_values": {
            "gini_proxy": float(top_2_share),
            "total_volume": int(district_perf['total_enrolments'].sum())
        },
        "final_result": {
            "top_decile_share": float(decile_stats.loc[10, 'sum'] / decile_stats['sum'].sum()),
            "bottom_decile_share": float(decile_stats.loc[1, 'sum'] / decile_stats['sum'].sum())
        },
        "risk_classification": "MEDIUM" if top_2_share > 0.6 else "LOW",
        "decision": "Concentration Check",
        "risk_or_insight": "High concentration in top deciles." if top_2_share > 0.6 else "Balanced distribution across deciles.",
        "visualization_data": {
            "deciles": decile_stats.index.tolist(),
            "volume_share": (decile_stats['sum'] / decile_stats['sum'].sum() * 100).round(1).tolist(),
            "avg_volume": decile_stats['mean'].round(0).tolist()
        }
    }
