"""
Analytics Utilities Module
Provides standardized response formats and helper functions for all analytics techniques.
"""

from typing import Dict, Any, List
from dataclasses import dataclass, asdict
import json


@dataclass
class AnalyticsResponse:
    """Standardized response format for all analytics computations."""
    
    technique: str
    description: str
    formula: str
    calculation_steps: List[Dict[str, Any]]
    intermediate_values: Dict[str, Any]
    final_result: Dict[str, Any]
    risk_classification: str
    decision: str
    risk_or_insight: str = ""
    visualization_data: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, handling nested structures."""
        data = asdict(self)
        if data.get('visualization_data') is None:
            data['visualization_data'] = {}
        return data


def format_step(
    step_num: int,
    title: str,
    description: str,
    input_val: Any,
    output_val: Any,
    details: Any = None
) -> Dict[str, Any]:
    """
    Format a calculation step for display.
    
    Args:
        step_num: Step number (1-based)
        title: Step title
        description: Step description
        input_val: Input to this step
        output_val: Output from this step
        details: Optional detailed breakdown
        
    Returns:
        Formatted step dictionary
    """
    step = {
        "step": step_num,
        "title": title,
        "description": description,
        "input": str(input_val),
        "output": str(output_val)
    }
    if details is not None:
        step["details"] = details
    return step


def create_response(
    technique: str,
    description: str,
    formula: str,
    steps: List[Dict[str, Any]],
    intermediate_values: Dict[str, Any],
    final_result: Dict[str, Any],
    risk_classification: str,
    decision: str,
    risk_or_insight: str = "",
    visualization_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Create standardized analytics response.
    
    Returns:
        Dictionary ready for JSON serialization
    """
    response = AnalyticsResponse(
        technique=technique,
        description=description,
        formula=formula,
        calculation_steps=steps,
        intermediate_values=intermediate_values,
        final_result=final_result,
        risk_classification=risk_classification,
        decision=decision,
        risk_or_insight=risk_or_insight,
        visualization_data=visualization_data or {}
    )
    return response.to_dict()


def assess_risk(
    metric_value: float,
    thresholds: Dict[str, float],
    ascending: bool = False
) -> tuple[str, str]:
    """
    Assess risk level based on metric value and thresholds.
    
    Args:
        metric_value: The metric value to assess
        thresholds: Dict with keys 'high', 'medium', 'low' containing threshold values
        ascending: If True, higher values are worse; if False, lower values are worse
        
    Returns:
        Tuple of (risk_level, decision_text)
    """
    if ascending:
        if metric_value > thresholds.get('high', float('inf')):
            return ("HIGH", "Critical threshold exceeded - immediate action required")
        elif metric_value > thresholds.get('medium', float('inf')):
            return ("MEDIUM", "Moderate risk detected - review recommended")
        else:
            return ("LOW", "Within acceptable parameters")
    else:
        if metric_value < thresholds.get('high', 0):
            return ("HIGH", "Critical threshold exceeded - immediate action required")
        elif metric_value < thresholds.get('medium', 0):
            return ("MEDIUM", "Moderate risk detected - review recommended")
        else:
            return ("LOW", "Within acceptable parameters")


def build_visualization_data(
    chart_type: str,
    labels: List[str],
    datasets: Dict[str, List[float]],
    metadata: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Build consistent visualization data structure.
    
    Args:
        chart_type: 'bar', 'line', 'scatter', 'pie', etc.
        labels: X-axis or category labels
        datasets: Dict mapping dataset names to value arrays
        metadata: Optional additional metadata
        
    Returns:
        Visualization data dictionary
    """
    return {
        "chart_type": chart_type,
        "labels": labels,
        "datasets": datasets,
        "metadata": metadata or {}
    }
