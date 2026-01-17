import React from 'react';

const PowerBIContainer = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto pl-72 h-screen flex flex-col">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-white mb-2">Power BI Integration</h1>
                <p className="text-slate-400">Embedded Enterprise Reporting (Mock Environment)</p>
            </div>

            <div className="flex-1 bg-slate-200 rounded-lg overflow-hidden relative group">
                {/* Mock iframe representation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-[#F2F2F2]">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg"
                        alt="Power BI Logo"
                        className="w-24 h-24 mb-6 opacity-80"
                    />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Secure Report Container</h3>
                    <p className="text-sm max-w-md text-center mb-8">
                        In a production environment, this container validates Azure AD tokens and embeds
                        live .pbix reports for "National Enrolment Trends".
                    </p>

                    <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full text-left border border-slate-300">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Simulation Context</div>
                        <div className="space-y-3 font-mono text-xs text-slate-600">
                            <div className="flex justify-between border-b pb-1"><span>Tenant ID:</span> <span>72f988bf-86f1-41af-91ab-2d7cd011db47</span></div>
                            <div className="flex justify-between border-b pb-1"><span>Report ID:</span> <span>c4149666-4876-4be0-835c-303799320140</span></div>
                            <div className="flex justify-between border-b pb-1"><span>Dataset:</span> <span>UIDAI_Master_Analytical_Store</span></div>
                            <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-600 font-bold">Ready to Embed</span></div>
                        </div>
                    </div>
                </div>

                {/* Overlay to simulate interaction */}
                <div className="absolute top-0 right-0 p-4">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded shadow">DEMO MODE</span>
                </div>
            </div>
        </div>
    );
};

export default PowerBIContainer;
