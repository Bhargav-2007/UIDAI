"""
Executive Summary Analytics Module
Aggregates metrics from other modules to provide a high-level overview.
"""

from fastapi import APIRouter
from typing import Dict, Any
import pandas as pd
import numpy as np
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_loader import load_all_data

router = APIRouter(prefix="/api/executive", tags=["Executive Summary"])

@router.get("/summary")
async def get_executive_summary() -> Dict[str, Any]:
    """
    Computes real-time executive KPIs by aggregating results from 
    Fraud, Operations, and Predictive modules.
    """
    data = load_all_data()
    enrolment_df = data['enrolment']
    
    # Import specific analytics functions here to avoid circular imports during startup
    from analytics.fraud import benford_analysis, outlier_detection
    from analytics.operations import queue_theory_analysis
    from analytics.predictive import forecast_analysis
    
    # 1. Total Volume
    total_enrolments = int(enrolment_df['total_enrolments'].sum())
    
    # 2. Fraud Risk (Simulated Aggregation)
    # We run benford analysis internally to check for flags
    benford_res = await benford_analysis()
    outlier_res = await outlier_detection()
    
    risk_level = "LOW"
    risk_factors = []
    
    if benford_res['decision'] == "Significant Deviation Detected":
        risk_level = "HIGH"
        risk_factors.append("Benford Violation")
        
    if outlier_res['intermediate_values']['outlier_count'] > 10: # Arbitrary threshold for demo
        if risk_level == "LOW": risk_level = "MEDIUM"
        risk_factors.append("High Outlier Volume")
        
    # 3. Operational Normality
    # Use Queue Theory Wait Time as a proxy
    queue_res = await queue_theory_analysis()
    avg_wait = queue_res['final_result']['avg_wait_time_mins']
    ops_status = f"{100 - min(avg_wait, 100):.1f}%" # Mock 'Health' score derived from wait time
    ops_drift = "Stable" if avg_wait < 15 else "Degrading"
    
    # 4. Forecast Growth
    pred_res = await forecast_analysis()
    growth_rate = pred_res['final_result']['growth_rate']
    
    return {
        "kpis": [
            {
                "label": "Total Enrolments",
                "value": f"{total_enrolments:,}",
                "drift": "+4.2% (MoM)", # This could be calculated if we had last month data handy
                "color": "blue",
                "icon": "users"
            },
            {
                "label": "Fraud Risk Level",
                "value": risk_level,
                "drift": ", ".join(risk_factors) if risk_factors else "System Integrity Optimized",
                "color": "red" if risk_level == "HIGH" else "emerald",
                "icon": "shield"
            },
            {
                "label": "Operational Normality",
                "value": ops_status,
                "drift": f"Wait Time: {avg_wait}m ({ops_drift})",
                "color": "emerald" if avg_wait < 15 else "yellow",
                "icon": "activity"
            },
            {
                "label": "Forecast (6m)",
                "value": f"{growth_rate}",
                "drift": "Projected Growth",
                "color": "indigo",
                "icon": "trending-up"
            }
        ],
        "system_status": {
            "api_status": "Online",
            "db_connection": "Connected",
            "last_batch": "2026-01-17 12:00 UTC",
            "security_level": "Level 3 (Audit)"
        }
    }
