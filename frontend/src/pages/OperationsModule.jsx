import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const OperationsModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        { id: 'queue-theory', title: "Queue Theory", description: "Little's Law application to optimize wait times." },
        { id: 'load-balance', title: "Load Balancing", description: "Resource utilization analysis across centers." },
        { id: 'throughput', title: "Throughput", description: "Processing velocity analysis." },
        { id: 'yield', title: "Yield Analysis", description: "Success rate vs Rejection rate optimization." },
        { id: 'pareto', title: "Pareto Analysis", description: "80/20 rule application for operational bottlenecks." }
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
            const response = await fetch(`http://localhost:8000/api/operations/${activeTechnique}`);
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
        return <div className="text-slate-500 text-center p-10">Visualization data loaded. Chart ready for rendering.</div>;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Operational Efficiency</h1>
                <p className="text-slate-400">Queue optimization, load balancing, and throughput analysis.</p>
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
                <div className="mb-8 p-4 bg-slate-900 border border-emerald-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-emerald-400 font-semibold">Ready to Optimize</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                            }`}
                    >
                        {loading ? 'Optimizing...' : 'Run Optimization'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Operational Visualization</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OperationsModule;
