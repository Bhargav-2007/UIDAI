import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const DescriptiveModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        {
            id: 'univariate',
            title: "Univariate Statistical Analysis",
            description: "Fundamental analysis of central tendency (Mean, Median) and dispersion (Std Dev, Range) to understand data distribution."
        },
        {
            id: 'timeseries',
            title: "Time Series Decomposition",
            description: "Breaks down enrolment volume into Trend, Seasonality, and Residual components to isolate underlying patterns."
        }
    ];

    const handleSelectTechnique = (techniqueId) => {
        setActiveTechnique(techniqueId);
        setData(null); // Reset data when switching techniques
        setExecuted(false);
    };

    const runAnalysis = async () => {
        if (!activeTechnique) return;
        setLoading(true);
        try {
            // Simulate slight delay for "Processing" feel if API is too fast
            await new Promise(r => setTimeout(r, 800));
            const response = await fetch(`http://localhost:8000/api/descriptive/${activeTechnique}`);
            const result = await response.json();
            setData(result);
            setExecuted(true);
        } catch (error) {
            console.error("Error fetching analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!data || !data.visualization_data) return null;
        const { visualization_data } = data;

        if (activeTechnique === 'univariate') {
            const d = visualization_data.histogram;
            const chartData = d.values.map((val, i) => ({
                bin: d.bin_edges[i],
                count: val
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="bin" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Bar dataKey="count" fill="#3b82f6" name="Frequency" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center text-xs text-slate-500 mt-2">Enrolment Volume Distribution</div>
                </div>
            );
        }

        if (activeTechnique === 'timeseries') {
            const d = visualization_data;
            const chartData = d.dates.slice(-60).map((date, i) => ({
                date,
                Observed: d.observed[d.observed.length - 60 + i],
                Trend: d.trend[d.trend.length - 60 + i],
                Seasonality: d.seasonality[d.seasonality.length - 60 + i]
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Observed" stroke="#94a3b8" dot={false} strokeWidth={1} />
                            <Line type="monotone" dataKey="Trend" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Seasonality" stroke="#10b981" strokeWidth={1} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Descriptive Analytics</h1>
                <p className="text-slate-400">Foundational statistical analysis and time series decomposition.</p>
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

            {/* Execution Area */}
            {activeTechnique && (
                <div className="mb-8 p-4 bg-slate-900 border border-blue-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-blue-400 font-semibold">Ready to Analyze</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : 'Run Analysis'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Statistical Visualization</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DescriptiveModule;
