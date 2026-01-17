import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const FraudModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        { id: 'benford', title: "Benford's Law", description: "Detects anomalies by analyzing the frequency distribution of leading digits." },
        { id: 'outliers', title: "Outlier Detection", description: "Identifies data points that deviate significantly using Z-Score and IQR methods." },
        { id: 'patterns', title: "Pattern Recog.", description: "Finds suspicious recurring sequences or numeric patterns." },
        { id: 'duplicates', title: "Identity Resolution", description: "Fuzzy matching to detect potential duplicate identities across datasets." },
        { id: 'forensic', title: "Forensic Analytics", description: "Deep-dive statistical tests for high-risk entities." }
    ];

    const handleSelectTechnique = (techniqueId) => {
        setActiveTechnique(techniqueId);
        setData(null);
        setExecuted(false);
    };

    const runAnalysis = async () => {
        if (!activeTechnique) return;
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const response = await fetch(`http://localhost:8000/api/fraud/${activeTechnique}`);
            const result = await response.json();
            setData(result);
            setExecuted(true);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!data || !data.visualization_data) return null;
        const { visualization_data } = data;

        if (activeTechnique === 'benford') {
            const d = visualization_data;
            const chartData = d.labels.map((digit, i) => ({
                digit,
                'Actual %': d.observed[i],
                'Expected (Benford) %': d.expected[i]
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="digit" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Legend />
                            <Bar dataKey="Actual %" fill="#ef4444" name="Actual %" />
                            <Bar dataKey="Expected (Benford) %" fill="#3b82f6" name="Expected (Benford) %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        } else if (activeTechnique === 'outliers' && visualization_data.histogram) {
            const bins = visualization_data.histogram.bin_edges;
            const values = visualization_data.histogram.values;
            const chartData = bins.slice(0, -1).map((bin, i) => ({
                range: `${Math.round(bin)}-${Math.round(bins[i + 1])}`,
                count: values[i]
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="range" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }
        
        return (
            <div className="text-slate-500 text-center p-10">
                <p className="text-sm">Visualization data loaded</p>
                <p className="text-xs text-slate-600 mt-2">Technique: {activeTechnique}</p>
                <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300">View Raw Data</summary>
                    <pre className="mt-2 bg-slate-950 p-4 rounded text-[10px] overflow-auto max-h-40">
                        {JSON.stringify(visualization_data, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Fraud & Integrity</h1>
                <p className="text-slate-400">Audit-grade forensic analytics and anomaly detection.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {techniques.map((tech) => (
                    <TechniqueCard
                        key={tech.id}
                        {...tech}
                        isActive={activeTechnique === tech.id}
                        onClick={() => handleSelectTechnique(tech.id)}
                    />
                ))}
            </div>

            {activeTechnique && (
                <div className="mb-8 p-4 bg-slate-900 border border-red-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-red-400 font-semibold">Ready to Scan</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20'
                            }`}
                    >
                        {loading ? 'Analyzing...' : 'Run Integrity Check'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Forensic Visualization</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FraudModule;
