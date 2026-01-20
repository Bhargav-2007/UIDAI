"""
Data Explorer Router
Provides raw data inspection endpoints for the UIDAI platform.
"""

from fastapi import APIRouter, Query
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from data_loader import load_enrolment_data, load_demographic_data, load_biometric_data

router = APIRouter(prefix="/api/explorer", tags=["Data Explorer"])

@router.get("/data")
async def get_explorer_data(
    dataset: str = Query("enrolment", description="Dataset to explore: enrolment, demographic, biometric"),
    limit: int = Query(50, description="Number of records to return"),
    offset: int = Query(0, description="Offset for pagination")
) -> Dict[str, Any]:
    """
    Returns a sample of raw records from the specified dataset.
    """
    try:
        if dataset == "enrolment":
            df = load_enrolment_data()
        elif dataset == "demographic":
            df = load_demographic_data()
        elif dataset == "biometric":
            df = load_biometric_data()
        else:
            return {"error": "Invalid dataset specified", "data": []}

        # Select a subset of columns for display
        if dataset == "enrolment":
            cols = ['date', 'state', 'district', 'sub_district', 'pincode', 'gender', 'age_0_5', 'age_5_17', 'age_18_greater', 'total_enrolments']
        elif dataset == "demographic":
            cols = ['date', 'state', 'district', 'demo_h_address', 'demo_gender', 'demo_dob', 'demo_mobile', 'total_demo_updates']
        else: # biometric
            cols = ['date', 'state', 'district', 'bio_auth', 'bio_enrol', 'total_bio_updates']

        # Ensure columns exist
        cols = [c for c in cols if c in df.columns]
        
        # Paginate
        sample_df = df[cols].iloc[offset : offset + limit].copy()
        
        # Convert NaN to None for JSON
        sample_df = sample_df.replace({np.nan: None})
        
        # Add a generated ID for Row rendering
        records = sample_df.to_dict('records')
        for i, rec in enumerate(records):
            rec['id'] = f"REF-{offset + i + 1000}"
            if 'date' in rec and rec['date']:
                rec['date'] = str(rec['date']).split(' ')[0]

        return {
            "dataset": dataset,
            "total_records": len(df),
            "limit": limit,
            "offset": offset,
            "data": records
        }
    except Exception as e:
        return {"error": str(e), "data": []}
