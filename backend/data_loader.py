"""
Data Loader Module for Aadhaar Analytics Platform
Handles loading, combining, and preprocessing of all Aadhaar dataset CSV files.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache
from typing import Dict, Tuple
import os

# Base path for dataset
DATASET_BASE_PATH = Path(os.path.dirname(os.path.abspath(__file__))).parent / "Dataset"


def load_csv_files(folder_name: str) -> pd.DataFrame:
    """
    Load and combine all CSV files from a specific dataset folder.
    
    Args:
        folder_name: Name of the subfolder (e.g., 'api_data_aadhar_enrolment')
    
    Returns:
        Combined DataFrame from all CSV files in the folder
    """
    folder_path = DATASET_BASE_PATH / folder_name
    csv_files = list(folder_path.glob("*.csv"))
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {folder_path}")
    
    # Read and concatenate all CSV files
    dfs = []
    for csv_file in csv_files:
        df = pd.read_csv(csv_file)
        dfs.append(df)
    
    combined_df = pd.concat(dfs, ignore_index=True)
    return combined_df


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess the DataFrame:
    - Convert date column to datetime
    - Handle missing values
    - Sort by date
    
    Args:
        df: Raw DataFrame
    
    Returns:
        Preprocessed DataFrame
    """
    df = df.copy()
    
    # Convert date to datetime format (DD-MM-YYYY)
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y', errors='coerce')
        df = df.dropna(subset=['date'])
        df = df.sort_values('date')
    
    # Fill missing numeric values with 0
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    
    # Fill missing string values with 'Unknown'
    string_cols = df.select_dtypes(include=['object']).columns
    df[string_cols] = df[string_cols].fillna('Unknown')
    
    return df


@lru_cache(maxsize=1)
def load_enrolment_data() -> pd.DataFrame:
    """Load and cache enrolment data."""
    df = load_csv_files("api_data_aadhar_enrolment")
    df = preprocess_dataframe(df)
    
    # Calculate total enrolments per row
    age_cols = ['age_0_5', 'age_5_17', 'age_18_greater']
    existing_cols = [col for col in age_cols if col in df.columns]
    df['total_enrolments'] = df[existing_cols].sum(axis=1)
    
    return df


@lru_cache(maxsize=1)
def load_demographic_data() -> pd.DataFrame:
    """Load and cache demographic update data."""
    df = load_csv_files("api_data_aadhar_demographic")
    df = preprocess_dataframe(df)
    
    # Calculate total demographic updates
    update_cols = [col for col in df.columns if col.startswith('demo_')]
    df['total_demo_updates'] = df[update_cols].sum(axis=1)
    
    return df


@lru_cache(maxsize=1)
def load_biometric_data() -> pd.DataFrame:
    """Load and cache biometric update data."""
    df = load_csv_files("api_data_aadhar_biometric")
    df = preprocess_dataframe(df)
    
    # Calculate total biometric updates
    update_cols = [col for col in df.columns if col.startswith('bio_')]
    df['total_bio_updates'] = df[update_cols].sum(axis=1)
    
    return df


@lru_cache(maxsize=1)
def load_all_data() -> Dict[str, pd.DataFrame]:
    """
    Load all datasets and return as a dictionary.
    
    Returns:
        Dictionary with keys: 'enrolment', 'demographic', 'biometric'
    """
    return {
        'enrolment': load_enrolment_data(),
        'demographic': load_demographic_data(),
        'biometric': load_biometric_data()
    }


def get_data_statistics(df: pd.DataFrame) -> Dict:
    """
    Calculate basic statistics for a DataFrame.
    
    Args:
        df: Input DataFrame
    
    Returns:
        Dictionary containing row count, column info, missing values, date range
    """
    stats = {
        'row_count': len(df),
        'column_count': len(df.columns),
        'columns': list(df.columns),
        'missing_values': df.isnull().sum().to_dict(),
        'total_missing': int(df.isnull().sum().sum()),
    }
    
    # Date range if date column exists
    if 'date' in df.columns:
        stats['min_date'] = df['date'].min().strftime('%Y-%m-%d') if pd.notna(df['date'].min()) else None
        stats['max_date'] = df['date'].max().strftime('%Y-%m-%d') if pd.notna(df['date'].max()) else None
    
    return stats


def aggregate_by_state_month(df: pd.DataFrame, value_col: str) -> pd.DataFrame:
    """
    Aggregate data by state and month.
    
    Args:
        df: Input DataFrame with 'date' and 'state' columns
        value_col: Column to aggregate (sum)
    
    Returns:
        Aggregated DataFrame with state, year_month, and aggregated value
    """
    df = df.copy()
    df['year_month'] = df['date'].dt.to_period('M').astype(str)
    
    aggregated = df.groupby(['state', 'year_month'])[value_col].sum().reset_index()
    aggregated = aggregated.sort_values(['state', 'year_month'])
    
    return aggregated


def aggregate_by_month(df: pd.DataFrame, value_col: str) -> pd.DataFrame:
    """
    Aggregate data by month (nationwide).
    
    Args:
        df: Input DataFrame with 'date' column
        value_col: Column to aggregate (sum)
    
    Returns:
        Aggregated DataFrame with year_month and aggregated value
    """
    df = df.copy()
    df['year_month'] = df['date'].dt.to_period('M').astype(str)
    
    aggregated = df.groupby('year_month')[value_col].sum().reset_index()
    aggregated = aggregated.sort_values('year_month')
    
    return aggregated
