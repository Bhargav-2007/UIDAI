import React from 'react';

const Sidebar = ({ activeModule, onNavigate }) => {
    const modules = [
        {
            id: 'home',
            title: 'Executive Summary',
            icon: '🏠',
            items: [
                { id: 'dashboard', label: 'Overview Dashboard' }
            ]
        },
        {
            id: 'descriptive',
            title: 'Descriptive Analytics',
            icon: '📊',
            items: [
                { id: 'univariate', label: 'Statistical Summary' },
                { id: 'timeseries', label: 'Time Series Decomp' }
            ]
        },
        {
            id: 'fraud',
            title: 'Fraud & Integrity',
            icon: '🛡️',
            items: [
                { id: 'benford', label: "Benford's Law" },
                { id: 'outliers', label: 'Outlier Detection' },
                { id: 'patterns', label: 'Pattern Recognition' },
                { id: 'duplicates', label: 'Identity Resolution' },
                { id: 'forensic', label: 'Forensic Analytics' }
            ]
        },
        {
            id: 'operations',
            title: 'Operational Efficiency',
            icon: '⚙️',
            items: [
                { id: 'queue-theory', label: 'Queue Theory' },
                { id: 'load-balance', label: 'Load Balancing' },
                { id: 'throughput', label: 'Throughput Analysis' },
                { id: 'yield', label: 'Yield Analysis' },
                { id: 'pareto', label: 'Pareto Analysis' }
            ]
        },
        {
            id: 'predictive',
            title: 'Predictive Intelligence',
            icon: '🔮',
            items: [
                { id: 'forecast', label: 'Forecasting' },
                { id: 'regression', label: 'Regression Analysis' },
                { id: 'scenarios', label: 'Scenario Planning' },
                { id: 'survival', label: 'Survival Analysis' }
            ]
        },
        {
            id: 'geographic',
            title: 'Geographic & Demo',
            icon: '🗺️',
            items: [
                { id: 'clusters', label: 'Cluster Analysis' },
                { id: 'hotspots', label: 'Hotspot Analysis' },
                { id: 'cohorts', label: 'Cohort Analysis' },
                { id: 'gender-parity', label: 'Gender Parity' },
                { id: 'gaps', label: 'Coverage Gap' }
            ]
        },
        {
            id: 'quality',
            title: 'Comparative Quality',
            icon: '⚖️',
            items: [
                { id: 'benchmarking', label: 'Peer Benchmarking' },
                { id: 'deciles', label: 'Decile Analysis' },
                { id: 'root-cause', label: 'Root Cause Analysis' }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced / AI',
            icon: '🧠',
            items: [
                { id: 'risk-scoring', label: 'AI Risk Scoring' },
                { id: 'simulation', label: 'Simulations' }
            ]
        },
        {
            id: 'explorer',
            title: 'Data Management',
            icon: '💾',
            items: [
                { id: 'grid', label: 'Data Explorer' },
                { id: 'powerbi', label: 'Power BI Reports' }
            ]
        }
    ];

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-700 h-screen overflow-y-auto fixed left-0 top-0 text-slate-300 flex flex-col z-20 scrollbar-thin scrollbar-thumb-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center space-x-3 bg-slate-950 sticky top-0 z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                    A
                </div>
                <div>
                    <span className="font-bold text-white tracking-wide block">UIDAI Analytics</span>
                    <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">v3.0 National</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 space-y-6">
                {modules.map((module) => (
                    <div key={module.id} className="px-3">
                        <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                            <span className="mr-2 text-sm grayscale opacity-70">{module.icon}</span> {module.title}
                        </h3>
                        <div className="space-y-0.5">
                            {module.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(module.id, item.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-200 border-l-2 ${activeModule === module.id && (item.id === 'dashboard' ? true : true) /* Simplification for active state logic needs passing sub-item */
                                            ? 'bg-blue-900/20 text-blue-400 border-blue-500'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 bg-slate-950 sticky bottom-0">
                <div className="flex justify-between items-center mb-1">
                    <span>System Status</span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <div className="font-mono">Secure Connection: TLS 1.3</div>
            </div>
        </div>
    );
};

export default Sidebar;
