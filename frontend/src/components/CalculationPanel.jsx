import React from 'react';

const CalculationPanel = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl ring-1 ring-slate-800/50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                <div>
                    <h3 className="font-bold text-white text-lg flex items-center">
                        <span className="text-blue-400 mr-2">ƒ(x)</span> Calculation View
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 w-full truncate">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.risk_classification === 'HIGH' ? 'bg-red-900/30 text-red-400 border-red-800' :
                        data.risk_classification === 'LOW' || data.risk_classification === 'INFO' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                            'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                    }`}>
                    {data.risk_classification || 'ANALYSIS COMPLETE'}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">

                {/* 1. Formula & Description */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technique & Formula</h4>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <div className="font-semibold text-slate-300 mb-1">{data.technique}</div>
                            <div className="text-sm text-slate-400 mb-3 leading-relaxed">{data.description}</div>
                            <div className="font-mono text-xs bg-slate-900 p-2 rounded border border-slate-700 text-blue-300 overflow-x-auto">
                                {data.formula}
                            </div>
                        </div>
                    </div>

                    {/* Final Decision Box */}
                    <div className="lg:col-span-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Finding</h4>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-full flex flex-col justify-center">
                            <div className="text-2xl font-bold text-white mb-1">{data.decision || "Calculated"}</div>
                            <div className="text-sm text-slate-400">{data.risk_or_insight}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Step-by-Step Execution */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Execution Trace</h4>
                    <div className="space-y-3">
                        {data.calculation_steps?.map((step, index) => (
                            <div key={index} className="flex group">
                                <div className="mr-4 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-mono text-slate-400 group-hover:bg-blue-900 group-hover:text-blue-200 group-hover:border-blue-500 transition-colors">
                                        {step.step}
                                    </div>
                                    {index < data.calculation_steps.length - 1 && <div className="w-px h-full bg-slate-800 my-1 group-hover:bg-blue-900/50"></div>}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-slate-300 text-sm group-hover:text-white transition-colors">{step.title}</div>
                                        <div className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded">{step.input}</div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                                    <div className="mt-2 text-xs font-mono text-emerald-500 bg-emerald-900/10 inline-block px-2 py-1 rounded border border-emerald-900/20">
                                        → {step.output}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Intermediate Values JSON */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Intermediate State Variables</h4>
                    <pre className="bg-slate-950 text-[10px] p-4 rounded-lg border border-slate-800 text-slate-400 font-mono overflow-x-auto">
                        {JSON.stringify(data.intermediate_values, null, 2)}
                    </pre>
                </div>

            </div>
        </div>
    );
};

export default CalculationPanel;
