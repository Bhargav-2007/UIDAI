import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Line
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const QualityModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        {
            id: 'benchmarking',
            title: "Peer Benchmarking",
            description: "Compares state performance against national averages using Z-Score standardization."
        },
        {
            id: 'deciles',
            title: "Decile Analysis",
            description: "Segments performance into 10 buckets to identify concentration of volumes in top performers."
        }
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
            await new Promise(r => setTimeout(r, 800)); // Simulate processing time
            const response = await fetch(`http://localhost:8000/api/quality/${activeTechnique}`);
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

        if (activeTechnique === 'benchmarking') {
            const d = visualization_data;
            const sortedIndices = d.values.map((v, i) => i).sort((a, b) => d.values[b] - d.values[a]);
            const top5 = sortedIndices.slice(0, 5);
            const bottom5 = sortedIndices.slice(-5);
            const selectedIndices = [...top5, ...bottom5];

            const chartData = selectedIndices.map(i => ({
                state: d.labels[i],
                volume: d.values[i],
                average: d.average_line
            }));

            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="state" stroke="#94a3b8" fontSize={10} interval={0} tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Legend />
                            <Bar dataKey="volume" fill="#3b82f6" name="State Volume" />
                            <Line type="monotone" dataKey="average" stroke="#ef4444" strokeDasharray="5 5" name="National Avg" />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="text-center text-xs text-slate-500 mt-2">Top 5 and Bottom 5 States vs National Average</div>
                </div>
            );
        }

        if (activeTechnique === 'deciles') {
            const d = visualization_data;
            const chartData = d.deciles.map((decile, i) => ({
                decile: `D${decile}`,
                share: d.volume_share[i],
                avg: d.avg_volume[i]
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="decile" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Bar dataKey="share" fill="#8b5cf6" name="Volume Share %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Comparative Quality Analytics</h1>
                <p className="text-slate-400">Benchmarking and quality segmentation analysis.</p>
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
                <div className="mb-8 p-4 bg-slate-900 border border-purple-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-purple-400 font-semibold">Ready to Benchmark</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/20'
                            }`}
                    >
                        {loading ? 'Comparing...' : 'Run Benchmarking'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Comparative Visualization</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QualityModule;
