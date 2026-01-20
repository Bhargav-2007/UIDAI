/**
 * DifferenceSummary Component
 * Side-by-side comparison of Before vs After analysis capabilities
 */

function DifferenceSummary() {
    const beforePoints = [
        "Simple row counts and column statistics",
        "Basic bar charts without context",
        "Raw aggregations by state/month",
        "Missing values count only",
        "No trend identification",
        "No predictive capabilities",
        "Data shown without interpretation",
        "No actionable recommendations"
    ];

    const afterPoints = [
        "Key metrics with growth rates (MoM, YoY)",
        "Interactive trend visualizations",
        "Anomaly detection using Z-score analysis",
        "6-month predictive forecasting",
        "Demographic and regional insights",
        "Policy implications for governance",
        "Age-group distribution analysis",
        "Actionable intelligence for decision-makers"
    ];

    return (
        <div className="difference-panel">
            <h3 className="difference-title">
                Before vs After: Analysis Comparison
            </h3>

            <div className="difference-grid">
                <div className="difference-column before">
                    <h4>Before Analysis</h4>
                    <ul className="difference-list">
                        {beforePoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                        ))}
                    </ul>
                </div>

                <div className="difference-column after">
                    <h4>After Analysis</h4>
                    <ul className="difference-list">
                        {afterPoints.map((point, idx) => (
                            <li key={idx} style={{ color: '#e0f2fe' }}>{point}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
                <p style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Key Takeaway
                </p>
                <p style={{ fontSize: '0.875rem', color: '#a0aec0' }}>
                    The transformation from raw Aadhaar data to analyzed intelligence enables UIDAI, NIC, and MeitY
                    to make data-driven decisions, identify trends, detect anomalies, and forecast future enrolment
                    patterns for better resource allocation and policy planning.
                </p>
            </div>
        </div>
    );
}

export default DifferenceSummary;
