import React from 'react';

const Sidebar = ({ activeModule, onNavigate }) => {
    const modules = [
        {
            id: 'home',
            title: 'Executive',
            icon: 'EXE',
            items: [
                { id: 'home', label: 'Executive Summary' }
            ]
        },
        {
            id: 'descriptive',
            title: 'Descriptive',
            icon: 'DSC',
            items: [
                { id: 'descriptive', label: 'Statistical Summary' }
            ]
        },
        {
            id: 'fraud',
            title: 'Integrity',
            icon: 'FRD',
            items: [
                { id: 'fraud', label: "Fraud & Integrity" },
                { id: 'outliers', label: 'Outlier Detection' }
            ]
        },
        {
            id: 'operations',
            title: 'Operations',
            icon: 'OPS',
            items: [
                { id: 'operations', label: 'Operational Efficiency' }
            ]
        },
        {
            id: 'predictive',
            title: 'Predictive',
            icon: 'PRD',
            items: [
                { id: 'predictive', label: 'Forecasting' }
            ]
        },
        {
            id: 'geographic',
            title: 'Geographic',
            icon: 'GEO',
            items: [
                { id: 'geographic', label: 'Cohort Analysis' }
            ]
        },
        {
            id: 'quality',
            title: 'Quality',
            icon: 'QLT',
            items: [
                { id: 'quality', label: 'Benchmarking' }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced',
            icon: 'ADV',
            items: [
                { id: 'advanced', label: 'Risk Scoring' }
            ]
        },
        {
            id: 'explorer',
            title: 'Repository',
            icon: 'REP',
            items: [
                { id: 'grid', label: 'Data Explorer' },
                { id: 'powerbi', label: 'Power BI Reports' }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-[#002147] h-[calc(100vh-64px)] fixed left-0 top-16 text-white flex flex-col z-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50">
            <div className="flex-1 py-8 space-y-8">
                {modules.map((module) => (
                    <div key={module.id} className="px-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                            <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full mr-2"></span>
                            {module.title}
                        </h3>
                        <div className="space-y-1">
                            {module.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(module.id, item.id)}
                                    className={`w-full text-left px-3 py-2 rounded transition-all duration-200 text-xs font-medium ${activeModule === item.id
                                        ? 'bg-[#c5a059] text-[#002147] shadow-lg'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        <span>Node Status</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-600 text-center uppercase">Secure Environment V3.0</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
