"""
Before Analysis Router
Provides endpoints for raw data statistics and basic aggregations.
"""

from fastapi import APIRouter
from typing import Dict, Any
import pandas as pd

from data_loader import (
    load_enrolment_data,
    load_demographic_data,
    load_biometric_data,
    get_data_statistics,
    aggregate_by_state_month,
    aggregate_by_month
)

router = APIRouter(prefix="/api/before", tags=["Before Analysis"])


@router.get("/raw-data")
async def get_raw_data() -> Dict[str, Any]:
    """
    Return basic statistics and raw aggregated data.
    
    This endpoint provides:
    - Row count, column info, missing values
    - Min/max dates
    - Raw aggregated data (enrolments per state/month)
    
    This represents the "BEFORE" state - raw data without intelligence.
    """
    # Load all datasets
    enrolment_df = load_enrolment_data()
    demographic_df = load_demographic_data()
    biometric_df = load_biometric_data()
    
    # Get statistics for each dataset
    enrolment_stats = get_data_statistics(enrolment_df)
    demographic_stats = get_data_statistics(demographic_df)
    biometric_stats = get_data_statistics(biometric_df)
    
    # Basic aggregations (raw, no interpretation)
    enrolment_by_state = aggregate_by_state_month(enrolment_df, 'total_enrolments')
    enrolment_by_month = aggregate_by_month(enrolment_df, 'total_enrolments')
    
    demographic_by_month = aggregate_by_month(demographic_df, 'total_demo_updates')
    biometric_by_month = aggregate_by_month(biometric_df, 'total_bio_updates')
    
    # State-wise totals (simple sum)
    state_totals = enrolment_df.groupby('state')['total_enrolments'].sum().reset_index()
    state_totals = state_totals.sort_values('total_enrolments', ascending=False)
    
    # District-wise simple count
    district_counts = enrolment_df.groupby(['state', 'district'])['total_enrolments'].sum().reset_index()
    district_counts = district_counts.sort_values('total_enrolments', ascending=False).head(20)
    
    return {
        "message": "Raw Data - No Intelligence Applied",
        "description": "This is unprocessed data showing basic counts and aggregations without any analytical insights.",
        "statistics": {
            "enrolment": enrolment_stats,
            "demographic": demographic_stats,
            "biometric": biometric_stats
        },
        "raw_aggregations": {
            "enrolment_by_state": enrolment_by_state.to_dict('records'),
            "enrolment_by_month": enrolment_by_month.to_dict('records'),
            "demographic_by_month": demographic_by_month.to_dict('records'),
            "biometric_by_month": biometric_by_month.to_dict('records'),
            "top_states": state_totals.head(10).to_dict('records'),
            "top_districts": district_counts.to_dict('records')
        }
    }
