import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import TechniqueCard from '../components/TechniqueCard';
import CalculationPanel from '../components/CalculationPanel';

const PredictiveModule = () => {
    const [activeTechnique, setActiveTechnique] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const techniques = [
        { id: 'forecast', title: "Forecasting", description: "Time-series forecasting (ARIMA/Prophet) for enrolment volumes." },
        { id: 'regression', title: "Regression Analysis", description: "Multivariate regression to identify growth drivers." },
        { id: 'scenarios', title: "Scenario Planning", description: "What-if analysis for policy changes." },
        { id: 'survival', title: "Survival Analysis", description: "Time-to-event analysis for drop-offs." }
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
            const response = await fetch(`http://localhost:8000/api/predictive/${activeTechnique}`);
            const result = await response.json();
            setData(result);
            setExecuted(true);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Predictive Intelligence</h1>
                <p className="text-slate-400">Forecasting and future scenario planning.</p>
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
                <div className="mb-8 p-4 bg-slate-900 border border-indigo-900/50 rounded-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <h3 className="text-indigo-400 font-semibold">Ready to Forecast</h3>
                        <p className="text-xs text-slate-500">Selected Technique: {techniques.find(t => t.id === activeTechnique)?.title}</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md font-bold text-white transition-all ${loading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'
                            }`}
                    >
                        {loading ? 'Simulating...' : 'Run Forecast'}
                    </button>
                </div>
            )}

            {executed && data && (
                <div className="space-y-6 animate-fadeIn">
                    <CalculationPanel data={data} loading={loading} />
                    {data && (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Prediction Visualization</h3>
                            {renderChart()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    function renderChart() {
        if (!data || !data.visualization_data) return null;
        const { visualization_data } = data;

        if (activeTechnique === 'forecast' && visualization_data.historical) {
            // Combine historical and forecast data
            const historical = visualization_data.historical || {};
            const forecast = visualization_data.forecast || {};
            
            const historicalData = (historical.months || []).slice(-24).map((month, i) => ({
                month,
                value: historical.values[historical.values.length - 24 + i],
                type: 'historical'
            }));
            
            const forecastData = (forecast.months || []).map((month, i) => ({
                month,
                value: forecast.values[i],
                ci_lower: forecast.ci_lower[i],
                ci_upper: forecast.ci_upper[i],
                type: 'forecast'
            }));
            
            const chartData = [...historicalData, ...forecastData];
            
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Enrolments" strokeWidth={2} />
                            <Line type="monotone" dataKey="ci_upper" stroke="#10b981" name="Upper CI" strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="ci_lower" stroke="#ef4444" name="Lower CI" strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        } else if (activeTechnique === 'regression' && visualization_data.feature_importance) {
            const labels = visualization_data.feature_importance.labels;
            const values = visualization_data.feature_importance.values;
            const chartData = labels.map((label, i) => ({
                feature: label,
                importance: values[i]
            }));
            
            return (
                <div className="h-80 w-full mt-6">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="feature" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Bar dataKey="importance" fill="#8b5cf6" name="Importance %" />
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
    }
};

export default PredictiveModule;
