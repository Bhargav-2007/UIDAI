/**
 * AfterAnalysis Component
 * Displays analyzed data with blue/green theme - actionable intelligence
 */

import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell,
    ComposedChart
} from 'recharts';

const API_BASE = 'http://localhost:8000';

// Format large numbers with K/M/B suffix
const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
};

function AfterAnalysis() {
    const [trends, setTrends] = useState(null);
    const [anomalies, setAnomalies] = useState(null);
    const [insights, setInsights] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [trendsRes, anomaliesRes, insightsRes, forecastRes] = await Promise.all([
                    fetch(`${API_BASE}/api/after/trends`),
                    fetch(`${API_BASE}/api/after/anomalies`),
                    fetch(`${API_BASE}/api/after/insights`),
                    fetch(`${API_BASE}/api/after/forecast`)
                ]);

                if (!trendsRes.ok || !anomaliesRes.ok || !insightsRes.ok || !forecastRes.ok) {
                    throw new Error('Failed to fetch analysis data');
                }

                setTrends(await trendsRes.json());
                setAnomalies(await anomaliesRes.json());
                setInsights(await insightsRes.json());
                setForecast(await forecastRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Analyzing data and generating insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p>Error loading analysis: {error}</p>
                <p>Make sure the backend server is running on port 8000</p>
            </div>
        );
    }

    // Prepare trend data with growth indicators
    const trendData = trends?.trends?.enrolment?.time_series || [];
    const forecastData = forecast?.forecasts?.enrolment?.forecast || [];

    // Combine historical and forecast data for chart
    const combinedChartData = [
        ...trendData.map(item => ({ ...item, type: 'historical' })),
        ...forecastData.map(item => ({
            year_month: item.month,
            total_enrolments: item.predicted_value,
            type: 'forecast'
        }))
    ];

    return (
        <div className="after-analysis fade-in">
            {/* Header Badge */}
            <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
                Analyzed Data with Actionable Intelligence
            </div>

            {/* Key Metrics with Growth */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>KPI</div>
                    <div>
                        <h2 className="section-title">Key Performance Indicators</h2>
                        <p className="section-subtitle">Metrics with trend analysis and growth rates</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(insights?.key_metrics?.total_enrolments)}</div>
                        <div className="stat-label">Total Enrolments</div>
                        <div className={`stat-change ${trends?.trends?.enrolment?.overall_trend === 'increasing' ? 'positive' : 'negative'}`}>
                            {trends?.trends?.enrolment?.overall_trend === 'increasing' ? '↑' : '↓'} {trends?.trends?.enrolment?.avg_mom_growth}% MoM
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(insights?.key_metrics?.total_demographic_updates)}</div>
                        <div className="stat-label">Demographic Updates</div>
                        <div className={`stat-change ${trends?.trends?.demographic_updates?.overall_trend === 'increasing' ? 'positive' : 'negative'}`}>
                            {trends?.trends?.demographic_updates?.overall_trend === 'increasing' ? '↑' : '↓'} {trends?.trends?.demographic_updates?.avg_mom_growth}% MoM
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(insights?.key_metrics?.total_biometric_updates)}</div>
                        <div className="stat-label">Biometric Updates</div>
                        <div className={`stat-change ${trends?.trends?.biometric_updates?.overall_trend === 'increasing' ? 'positive' : 'negative'}`}>
                            {trends?.trends?.biometric_updates?.overall_trend === 'increasing' ? '↑' : '↓'} {trends?.trends?.biometric_updates?.avg_mom_growth}% MoM
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{insights?.key_metrics?.states_covered}</div>
                        <div className="stat-label">States/UTs Covered</div>
                        <div className="stat-change positive">
                            {insights?.key_metrics?.districts_covered} Districts
                        </div>
                    </div>
                </div>
            </section>

            {/* Trend Analysis Charts */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>TRD</div>
                    <div>
                        <h2 className="section-title">Trend Analysis</h2>
                        <p className="section-subtitle">Time-series patterns with growth rate visualization</p>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="card chart-card">
                        <h3 className="chart-title">
                            <span style={{ color: '#10b981' }}>●</span> Enrolment Trend with Growth Rate
                        </h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={trendData.slice(-12)} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                                    <XAxis
                                        dataKey="year_month"
                                        stroke="#64748b"
                                        angle={-45}
                                        textAnchor="end"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis yAxisId="left" stroke="#64748b" tickFormatter={formatNumber} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                                        formatter={(value, name) => [
                                            name === 'total_enrolments' ? formatNumber(value) : value + '%',
                                            name === 'total_enrolments' ? 'Enrolments' : 'MoM Growth'
                                        ]}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="total_enrolments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Enrolments" />
                                    <Line yAxisId="right" type="monotone" dataKey="mom_growth" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="MoM %" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card chart-card">
                        <h3 className="chart-title">
                            <span style={{ color: '#8b5cf6' }}>●</span> Updates Comparison Trend
                        </h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={trends?.trends?.demographic_updates?.time_series?.slice(-12) || []}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                                >
                                    <defs>
                                        <linearGradient id="demoGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                                    <XAxis
                                        dataKey="year_month"
                                        stroke="#64748b"
                                        angle={-45}
                                        textAnchor="end"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis stroke="#64748b" tickFormatter={formatNumber} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                                        formatter={(value) => [formatNumber(value), 'Updates']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_demo_updates"
                                        stroke="#8b5cf6"
                                        fillOpacity={1}
                                        fill="url(#demoGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Forecast Section */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)' }}>FCT</div>
                    <div>
                        <h2 className="section-title">6-Month Forecast</h2>
                        <p className="section-subtitle">Predictive analytics using linear regression</p>
                    </div>
                </div>

                <div className="card forecast-card">
                    <div className="forecast-header">
                        <div>
                            <h3 style={{ marginBottom: '0.25rem' }}>Enrolment Volume Prediction</h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                R² Confidence: {(forecast?.forecasts?.enrolment?.model_info?.r_squared * 100).toFixed(1)}%
                            </p>
                        </div>
                        <span className="forecast-badge">
                            Trend: {forecast?.forecasts?.enrolment?.model_info?.trend?.toUpperCase()}
                        </span>
                    </div>

                    <div className="chart-container" style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={combinedChartData.slice(-18)} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                                <defs>
                                    <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                                <XAxis
                                    dataKey="year_month"
                                    stroke="#64748b"
                                    angle={-45}
                                    textAnchor="end"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis stroke="#64748b" tickFormatter={formatNumber} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                                    formatter={(value, name, props) => [
                                        formatNumber(value),
                                        props.payload.type === 'forecast' ? 'Predicted' : 'Actual'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total_enrolments"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#histGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="stats-grid" style={{ marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                            <div style={{ color: '#10b981', fontWeight: 600 }}>{formatNumber(forecast?.forecasts?.enrolment?.forecast_avg)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Monthly Forecast</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                            <div style={{ color: '#22d3ee', fontWeight: 600 }}>{formatNumber(forecast?.forecasts?.enrolment?.total_forecasted)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total 6-Month Projected</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Anomaly Detection */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>!]</div>
                    <div>
                        <h2 className="section-title">Anomaly Detection</h2>
                        <p className="section-subtitle">Statistical outliers flagged using Z-score analysis</p>
                    </div>
                </div>

                <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: '#ef4444' }}>{anomalies?.summary?.total_national_anomalies}</div>
                        <div className="stat-label">National Anomalies</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: '#f59e0b' }}>{anomalies?.summary?.total_state_anomalies}</div>
                        <div className="stat-label">State Anomalies</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: '#ef4444' }}>{anomalies?.summary?.total_district_anomalies}</div>
                        <div className="stat-label">District Anomalies</div>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1rem', color: '#f59e0b' }}>Flagged Districts</h4>
                    {(anomalies?.district_level || []).slice(0, 5).map((anomaly, idx) => (
                        <div key={idx} className="anomaly-item">
                            <div className="anomaly-header">
                                <span><strong>{anomaly.district}</strong>, {anomaly.state}</span>
                                <span className={`anomaly-type ${anomaly.anomaly_type}`}>
                                    {anomaly.anomaly_type} ({anomaly.deviation_percent > 0 ? '+' : ''}{anomaly.deviation_percent}%)
                                </span>
                            </div>
                            <p className="anomaly-explanation">{anomaly.explanation}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Insights Section */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>INS</div>
                    <div>
                        <h2 className="section-title">Key Insights</h2>
                        <p className="section-subtitle">Interpreted findings with societal significance</p>
                    </div>
                </div>

                <div className="insights-grid">
                    {(insights?.insights || []).map((insight, idx) => (
                        <div key={idx} className="card insight-card slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="insight-header">
                                <span className="insight-category">{insight.category}</span>
                                <span className={`insight-significance ${insight.significance}`}>
                                    {insight.significance} priority
                                </span>
                            </div>
                            <h4 className="insight-title">{insight.finding}</h4>
                            <p className="insight-detail">{insight.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Policy Implications */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}>POL</div>
                    <div>
                        <h2 className="section-title">Policy Implications</h2>
                        <p className="section-subtitle">Actionable recommendations for governance</p>
                    </div>
                </div>

                <div className="insights-grid">
                    {(insights?.policy_implications || []).map((policy, idx) => (
                        <div key={idx} className={`card policy-card ${policy.priority}`}>
                            <div className="policy-area">{policy.area}</div>
                            <p className="policy-implication">{policy.implication}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AfterAnalysis;
