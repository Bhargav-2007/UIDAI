import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const AdvancedModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        {
            id: 'risk-scoring',
            title: "AI-Driven Risk Scoring",
            description: "Random Forest model to predict risk probability based on multi-dimensional feature analysis."
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
            await new Promise(r => setTimeout(r, 1200)); // Simulate slightly longer ML training
            const response = await fetch(`http://localhost:8000/api/advanced/${activeTechnique}`);
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

        if (activeTechnique === 'risk-scoring') {
            const d = visualization_data;
            const chartData = d.features.map((f, i) => ({
                feature: f,
                importance: d.importance[i]
            }));
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <YAxis dataKey="feature" type="category" stroke="#94a3b8" width={150} tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Bar dataKey="importance" fill="#ec4899" name="Feature Importance (Gini)" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center text-xs text-slate-500 mt-2">Model Feature Importance (Random Forest)</div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics & AI</h1>
                <p className="text-slate-400">Experimental AI models and simulations.</p>
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
                <div className="mb-8 p-4 bg-slate-900 border border-pink-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-pink-400 font-semibold">Ready to Train Model</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-900/20'
                            }`}
                    >
                        {loading ? 'Training Model...' : 'Train & Score'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Model Interpretability</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedModule;
