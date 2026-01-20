from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics import executive, descriptive, fraud, operations, predictive, geographic, quality, advanced
from routers import before as before_router

router = APIRouter(prefix="/api/unified", tags=["Unified Analytics"])

@router.get("/executive")
async def get_executive(before: bool = Query(False)):
    if before:
        # Get raw stats for "Before"
        raw_data = await before_router.get_raw_data()
        enrolment_stats = raw_data["statistics"]["enrolment"]
        return {
            "labels": ["Total", "Min", "Max"],
            "datasets": [{
                "label": "Raw Enrolment Counts",
                "data": [enrolment_stats["row_count"], 0, 0], # Placeholder for raw
                "backgroundColor": "rgba(148, 163, 184, 0.5)"
            }],
            "kpis": [
                {"label": "Row Count", "value": enrolment_stats["row_count"], "format": "number"},
                {"label": "Missing Values", "value": enrolment_stats["total_missing"], "format": "number"},
                {"label": "Columns", "value": enrolment_stats["column_count"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Raw Data Overview (Before Analysis)"
        }
    else:
        # Get executive summary for "After"
        summary = await executive.get_executive_summary()
        # Transform KPIs
        kpis = []
        for k in summary["kpis"]:
            # Extract numeric value if possible
            val = k["value"]
            if isinstance(val, str) and val.endswith("%"):
                try: 
                    numeric_val = float(val.replace("%", ""))
                    kpis.append({"label": k["label"], "value": numeric_val, "format": "percentage"})
                except:
                    kpis.append({"label": k["label"], "value": val})
            elif isinstance(val, str) and "," in val:
                try:
                    numeric_val = float(val.replace(",", ""))
                    kpis.append({"label": k["label"], "value": numeric_val, "format": "number"})
                except:
                    kpis.append({"label": k["label"], "value": val})
            else:
                kpis.append({"label": k["label"], "value": val})

        return {
            "labels": ["Enrolment", "Security", "Operations", "Growth"],
            "datasets": [{
                "label": "System Health Index",
                "data": [85, 90, 75, 80], # Synthetic index for demo
                "borderColor": "#3b82f6",
                "fill": True
            }],
            "kpis": kpis,
            "chartType": "line",
            "title": "Executive Performance Summary (After Analysis)"
        }

@router.get("/descriptive")
async def get_descriptive(before: bool = Query(False)):
    if before:
        res = await descriptive.univariate_analysis()
        return {
            "labels": res["visualization_data"]["histogram"]["bin_edges"],
            "datasets": [{
                "label": "Enrolment Distribution",
                "data": res["visualization_data"]["histogram"]["values"],
                "backgroundColor": "rgba(148, 163, 184, 0.5)"
            }],
            "kpis": [
                {"label": "Mean", "value": res["final_result"]["mean"], "format": "number"},
                {"label": "Median", "value": res["final_result"]["median"], "format": "number"},
                {"label": "Std Dev", "value": res["final_result"]["std_dev"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Univariate Distribution (Before)"
        }
    else:
        res = await descriptive.time_series_decomposition()
        return {
            "labels": res["visualization_data"]["dates"][-30:], # Last 30 days
            "datasets": [
                {
                    "label": "Observed",
                    "data": res["visualization_data"]["observed"][-30:],
                    "borderColor": "#94a3b8",
                    "borderWidth": 1
                },
                {
                    "label": "Trend",
                    "data": res["visualization_data"]["trend"][-30:],
                    "borderColor": "#f59e0b",
                    "borderWidth": 2
                }
            ],
            "kpis": [
                {"label": "Trend Direction", "value": res["final_result"]["trend_direction"]},
                {"label": "Seasonality Amplitude", "value": res["intermediate_values"]["seasonality_amplitude"], "format": "number"},
                {"label": "Residual Noise", "value": res["intermediate_values"]["residual_noise"], "format": "number"}
            ],
            "chartType": "line",
            "title": "Time Series Decomposition (After)"
        }

@router.get("/fraud")
async def get_fraud(before: bool = Query(False)):
    if before:
        res = await fraud.benford_law_analysis()
        return {
            "labels": res["visualization_data"]["labels"],
            "datasets": [
                {"label": "Observed", "data": res["visualization_data"]["observed"], "backgroundColor": "#3b82f6"},
                {"label": "Expected", "data": res["visualization_data"]["expected"], "backgroundColor": "#94a3b8"}
            ],
            "kpis": [
                {"label": "Chi-Square", "value": res["final_result"]["chi_square"], "format": "number"},
                {"label": "Risk Level", "value": res["risk_classification"]}
            ],
            "chartType": "bar",
            "title": "Benford's Law Compliance (Before)"
        }
    else:
        res = await fraud.outlier_detection()
        # Transform for chart
        return {
            "labels": res["visualization_data"]["histogram"]["bin_edges"],
            "datasets": [{
                "label": "Outlier Frequency",
                "data": res["visualization_data"]["histogram"]["values"],
                "backgroundColor": "#ef4444"
            }],
            "kpis": [
                {"label": "Anomalies Detected", "value": res["final_result"]["anomaly_count"], "format": "number"},
                {"label": "Max Deviation", "value": res["final_result"]["max_deviation"], "format": "percentage"},
                {"label": "Threshold", "value": res["final_result"]["threshold"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Advanced Outlier Detection (After)"
        }

@router.get("/outliers")
async def get_outliers(before: bool = Query(False)):
    return await get_fraud(before=before) # Reuse fraud logic for now or customize

@router.get("/operations")
async def get_operations(before: bool = Query(False)):
    if before:
        res = await operations.throughput_analysis()
        return {
            "labels": res["visualization_data"]["time_series"]["dates"][-20:],
            "datasets": [{
                "label": "Raw Throughput",
                "data": res["visualization_data"]["time_series"]["values"][-20:],
                "borderColor": "#94a3b8"
            }],
            "kpis": [
                {"label": "Current Rate", "value": res["final_result"]["current_throughput"], "format": "number"},
                {"label": "Historical Avg", "value": res["final_result"]["historical_throughput"], "format": "number"}
            ],
            "chartType": "line",
            "title": "Operational Throughput (Before)"
        }
    else:
        res = await operations.queue_theory_analysis()
        return {
            "labels": ["System Utilization", "Queue Probability", "Wait Probability"],
            "datasets": [{
                "label": "System Metrics",
                "data": [
                    res["final_result"]["utilization_rho"] * 100,
                    res["final_result"]["prob_queue_p1"] * 100,
                    res["intermediate_values"]["service_intensity"] * 10
                ],
                "backgroundColor": ["#10b981", "#f59e0b", "#3b82f6"]
            }],
            "kpis": [
                {"label": "Wait Time", "value": res["final_result"]["avg_wait_time_wq"], "format": "number"},
                {"label": "Queue Length", "value": res["final_result"]["avg_queue_length_lq"], "format": "number"},
                {"label": "Utilization", "value": res["final_result"]["utilization_rho"], "format": "percentage"}
            ],
            "chartType": "bar",
            "title": "Queueing Theory Analysis (After)"
        }

@router.get("/predictive")
async def get_predictive(before: bool = Query(False)):
    if before:
        res = await predictive.regression_analysis()
        return {
            "labels": res["visualization_data"]["actual_vs_predicted"]["states"],
            "datasets": [
                {"label": "Actual", "data": res["visualization_data"]["actual_vs_predicted"]["actual"], "borderColor": "#94a3b8"},
                {"label": "Predicted", "data": res["visualization_data"]["actual_vs_predicted"]["predicted"], "borderColor": "#3b82f6", "borderDash": [5, 5]}
            ],
            "kpis": [
                {"label": "R-Squared", "value": res["final_result"]["r_squared"], "format": "number"},
                {"label": "Adj R-Squared", "value": res["final_result"]["adjusted_r_squared"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "State-wise Enrolment Regression (Before)"
        }
    else:
        res = await predictive.time_series_forecast()
        return {
            "labels": res["visualization_data"]["historical"]["months"] + res["visualization_data"]["forecast"]["months"],
            "datasets": [
                {
                    "label": "Historical",
                    "data": res["visualization_data"]["historical"]["values"] + [None] * len(res["visualization_data"]["forecast"]["months"]),
                    "borderColor": "#3b82f6"
                },
                {
                    "label": "Forecast",
                    "data": [None] * len(res["visualization_data"]["historical"]["values"]) + res["visualization_data"]["forecast"]["values"],
                    "borderColor": "#f59e0b",
                    "borderDash": [5, 5]
                }
            ],
            "kpis": [
                {"label": "Forecasted Total", "value": res["final_result"]["forecast_total"], "format": "number"},
                {"label": "Trend Direction", "value": res["final_result"]["trend_direction"]},
                {"label": "Avg Prediction", "value": res["final_result"]["forecast_avg"], "format": "number"}
            ],
            "chartType": "line",
            "title": "6-Month Volume Forecast (After)"
        }

@router.get("/geographic")
async def get_geographic(before: bool = Query(False)):
    if before:
        res = await geographic.hotspot_analysis()
        return {
            "labels": res["visualization_data"]["labels"][:10],
            "datasets": [{
                "label": "Hotspot Volume",
                "data": res["visualization_data"]["values"][:10],
                "backgroundColor": "#f59e0b"
            }],
            "kpis": [
                {"label": "Hotspots", "value": res["final_result"]["hotspot_count"], "format": "number"},
                {"label": "Avg Volume", "value": res["final_result"]["global_mean"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Geographic Hotspots (Before)"
        }
    else:
        res = await geographic.cohort_analysis()
        return {
            "labels": res["visualization_data"]["pie_chart"]["labels"],
            "datasets": [{
                "label": "Age Cohorts",
                "data": res["visualization_data"]["pie_chart"]["values"],
                "backgroundColor": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
            }],
            "kpis": [
                {"label": "Major Cohort", "value": res["final_result"]["dominant_cohort"]},
                {"label": "Cohort Diversity", "value": res["intermediate_values"]["cohort_count"], "format": "number"}
            ],
            "chartType": "pie",
            "title": "Demographic Cohort Analysis (After)"
        }

@router.get("/quality")
async def get_quality(before: bool = Query(False)):
    if before:
        res = await quality.peer_benchmarking()
        return {
            "labels": res["visualization_data"]["labels"][:10],
            "datasets": [{
                "label": "Performance",
                "data": res["visualization_data"]["values"][:10],
                "backgroundColor": "#94a3b8"
            }],
            "kpis": [
                {"label": "Total Peers", "value": len(res["visualization_data"]["labels"]), "format": "number"},
                {"label": "National Avg", "value": res["intermediate_values"]["national_mean"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "State Benchmarking (Before)"
        }
    else:
        res = await quality.decile_analysis()
        return {
            "labels": [f"D{i}" for i in res["visualization_data"]["deciles"]],
            "datasets": [{
                "label": "Volume by Decile",
                "data": res["visualization_data"]["volume_share"],
                "backgroundColor": "#6366f1"
            }],
            "kpis": [
                {"label": "Top 10% Share", "value": res["final_result"]["top_decile_share"], "format": "percentage"},
                {"label": "Gini Proxy", "value": res["intermediate_values"]["gini_proxy"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Equality Decile Analysis (After)"
        }

@router.get("/advanced")
async def get_advanced(before: bool = Query(False)):
    # Before and After for AI Risk can be similar but with more detail
    res = await advanced.ai_risk_scoring()
    if before:
        return {
            "labels": res["visualization_data"]["features"][:5],
            "datasets": [{
                "label": "Risk Factors",
                "data": res["visualization_data"]["importance"][:5],
                "backgroundColor": "#94a3b8"
            }],
            "kpis": [
                {"label": "Risk Score", "value": res["final_result"]["aggregate_risk_score"], "format": "number"},
                {"label": "Risk Category", "value": res["risk_classification"]}
            ],
            "chartType": "bar",
            "title": "Preliminary AI Risk Scan (Before)"
        }
    else:
        return {
            "labels": res["visualization_data"]["features"],
            "datasets": [{
                "label": "Feature Importance",
                "data": res["visualization_data"]["importance"],
                "backgroundColor": "#ef4444"
            }],
            "kpis": [
                {"label": "Total Indicators", "value": res["intermediate_values"]["feature_count"], "format": "number"},
                {"label": "Model Entropy", "value": res["intermediate_values"]["model_entropy"], "format": "number"}
            ],
            "chartType": "bar",
            "title": "Full AI Risk Decomposition (After)"
        }
