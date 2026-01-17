import React, { useState, useEffect } from 'react';

const Home = ({ onNavigate }) => {
    const [kpis, setKpis] = useState([]);
    const [systemStatus, setSystemStatus] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/executive/summary');
                const data = await response.json();
                setKpis(data.kpis);
                setSystemStatus(data.system_status);
            } catch (error) {
                console.error("Failed to load executive summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Executive Summary</h1>
                <p className="text-slate-400">National-Scale Decision Support System (v3.0)</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg animate-pulse">
                            <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-800 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                        </div>
                    ))
                ) : (
                    kpis.map((kpi, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg">
                            <div className="text-slate-400 text-sm flex justify-between items-center">
                                {kpi.label}
                                {/* Icon placeholder if needed, or stick to simple text */}
                            </div>
                            <div className={`text-2xl font-bold mt-2 text-${kpi.color}-400`}>{kpi.value}</div>
                            <div className="text-xs text-slate-500 mt-1">{kpi.drift}</div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                    <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => onNavigate('fraud', 'benford')} className="w-full text-left p-4 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all flex justify-between items-center group">
                            <div>
                                <div className="text-blue-400 font-medium group-hover:text-blue-300">Investigate Data Integrity</div>
                                <div className="text-xs text-slate-500">Run Benford's Law and Forensic Checks</div>
                            </div>
                            <span className="text-slate-500">→</span>
                        </button>
                        <button onClick={() => onNavigate('predictive', 'forecast')} className="w-full text-left p-4 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 transition-all flex justify-between items-center group">
                            <div>
                                <div className="text-indigo-400 font-medium group-hover:text-indigo-300">View Growth Projections</div>
                                <div className="text-xs text-slate-500">6-Month Forecast with Confidence Intervals</div>
                            </div>
                            <span className="text-slate-500">→</span>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                    <h3 className="font-semibold text-white mb-4">System Status</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-slate-400">API Status</span>
                            <span className="text-emerald-400 flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> {systemStatus.api_status || 'Checking...'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-slate-400">Database Connection</span>
                            <span className="text-emerald-400 flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> {systemStatus.db_connection || 'Checking...'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-slate-400">Last Batch Job</span>
                            <span className="text-slate-200">{systemStatus.last_batch || '...'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Security Clearance</span>
                            <span className="text-slate-200">{systemStatus.security_level || '...'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
