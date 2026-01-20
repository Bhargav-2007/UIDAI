/**
 * BeforeAnalysis Component
 * Displays raw data view with grey/neutral theme - no intelligence applied
 */

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API_BASE = 'http://localhost:8000';

// Format large numbers with K/M/B suffix
const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
};

function BeforeAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/api/before/raw-data`);
                if (!response.ok) throw new Error('Failed to fetch data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading raw data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p>Error loading data: {error}</p>
                <p>Make sure the backend server is running on port 8000</p>
            </div>
        );
    }

    const { statistics, raw_aggregations } = data || {};

    return (
        <div className="before-analysis fade-in">
            {/* Raw Data Badge */}
            <div className="raw-data-badge">
                Raw Data (No Intelligence Applied)
            </div>

            {/* Basic Statistics */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'rgba(107, 114, 128, 0.2)' }}>STA</div>
                    <div>
                        <h2 className="section-title">Basic Statistics</h2>
                        <p className="section-subtitle">Simple counts and metrics without interpretation</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(statistics?.enrolment?.row_count)}</div>
                        <div className="stat-label">Enrolment Records</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(statistics?.demographic?.row_count)}</div>
                        <div className="stat-label">Demographic Records</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{formatNumber(statistics?.biometric?.row_count)}</div>
                        <div className="stat-label">Biometric Records</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.enrolment?.column_count || 0}</div>
                        <div className="stat-label">Data Columns</div>
                    </div>
                </div>
            </section>

            {/* Date Range */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'rgba(107, 114, 128, 0.2)' }}>PER</div>
                    <div>
                        <h2 className="section-title">Data Period</h2>
                        <p className="section-subtitle">Raw date range without trend analysis</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.enrolment?.min_date || 'N/A'}</div>
                        <div className="stat-label">Start Date</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.enrolment?.max_date || 'N/A'}</div>
                        <div className="stat-label">End Date</div>
                    </div>
                </div>
            </section>

            {/* Raw State Data Chart */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'rgba(107, 114, 128, 0.2)' }}>RAW</div>
                    <div>
                        <h2 className="section-title">State-wise Raw Data</h2>
                        <p className="section-subtitle">Simple aggregation without insights</p>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="card chart-card">
                        <h3 className="chart-title">Top 10 States by Enrolments (Raw Count)</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={raw_aggregations?.top_states?.slice(0, 10) || []}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#666" tickFormatter={formatNumber} />
                                    <YAxis
                                        type="category"
                                        dataKey="state"
                                        stroke="#666"
                                        width={90}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatNumber(value), 'Enrolments']}
                                        contentStyle={{ background: '#1a1a25', border: '1px solid #333' }}
                                    />
                                    <Bar dataKey="total_enrolments" fill="#6b7280" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card chart-card">
                        <h3 className="chart-title">Monthly Enrolments (Raw)</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={raw_aggregations?.enrolment_by_month?.slice(-12) || []}
                                    margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="year_month"
                                        stroke="#666"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis stroke="#666" tickFormatter={formatNumber} />
                                    <Tooltip
                                        formatter={(value) => [formatNumber(value), 'Enrolments']}
                                        contentStyle={{ background: '#1a1a25', border: '1px solid #333' }}
                                    />
                                    <Bar dataKey="total_enrolments" fill="#6b7280" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Raw Data Table */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'rgba(107, 114, 128, 0.2)' }}>TBL</div>
                    <div>
                        <h2 className="section-title">Top Districts (Raw Data)</h2>
                        <p className="section-subtitle">No ranking analysis or significance</p>
                    </div>
                </div>

                <div className="card">
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th>District</th>
                                    <th>Total Enrolments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(raw_aggregations?.top_districts || []).slice(0, 10).map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.state}</td>
                                        <td>{row.district}</td>
                                        <td>{formatNumber(row.total_enrolments)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Missing Values Info */}
            <section className="section">
                <div className="section-header">
                    <div className="section-icon" style={{ background: 'rgba(107, 114, 128, 0.2)' }}>ERR</div>
                    <div>
                        <h2 className="section-title">Data Quality</h2>
                        <p className="section-subtitle">Missing values count (no action recommendations)</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.enrolment?.total_missing || 0}</div>
                        <div className="stat-label">Missing in Enrolment</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.demographic?.total_missing || 0}</div>
                        <div className="stat-label">Missing in Demographic</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{statistics?.biometric?.total_missing || 0}</div>
                        <div className="stat-label">Missing in Biometric</div>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    This view shows raw aggregated data without any analytical interpretation,
                    trend analysis, anomaly detection, or actionable insights.
                </p>
            </div>
        </div>
    );
}

export default BeforeAnalysis;
