import React from 'react';

const PowerBIContainer = () => {
    return (
        <div className="flex flex-col gap-8 fade-in min-h-[calc(100vh-140px)]">
            <div className="flex justify-between items-end border-b border-[#002147]/10 pb-6">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-[#002147] mb-2">Enterprise Reporting</h2>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Power BI Integration & National Enrolment Trends</p>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded border border-amber-200">
                    Live Session Simulation
                </div>
            </div>

            <div className="flex-1 bg-white border border-[#002147]/10 rounded shadow-sm overflow-hidden relative min-h-[500px]">
                {/* Mock iframe representation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-[#f8f9fa]">
                    <div className="p-12 flex flex-col items-center text-center">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg"
                            alt="Power BI Logo"
                            className="w-20 h-20 mb-8 grayscale opacity-20"
                        />
                        <h3 className="font-serif text-2xl font-bold text-[#002147] mb-4">Secure Report Container</h3>
                        <p className="text-sm max-w-lg text-slate-500 leading-relaxed mb-12">
                            In a production environment, this container validates Azure AD tokens and embeds
                            live .pbix reports filtered for authenticated regional nodes.
                        </p>

                        <div className="bg-white p-8 rounded border border-slate-200 shadow-sm max-w-xl w-full text-left">
                            <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em] mb-6 border-b pb-2">Technical Context</div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-[10px] text-slate-500">
                                <div className="uppercase tracking-wider">Tenant ID</div>
                                <div className="text-[#002147] font-bold">72f988bf-86f1-41af-91ab-2d7cd011db47</div>

                                <div className="uppercase tracking-wider">Report ID</div>
                                <div className="text-[#002147] font-bold">c4149666-4876-4be0-835c-303799320140</div>

                                <div className="uppercase tracking-wider">Dataset</div>
                                <div className="text-[#002147] font-bold">UIDAI_Master_Analytical_Store</div>

                                <div className="uppercase tracking-wider">Embed Status</div>
                                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    READY TO INITIALIZE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#002147] text-white text-[9px] font-bold uppercase tracking-widest rounded shadow-lg">
                        <svg className="w-3 h-3 text-[#c5a059]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.908-3.367 9.126-8 10.466-4.633-1.34-8-5.558-8-10.466 0-.68.056-1.35.166-2.001zm8 2a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        FIPS-Compliant Container
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PowerBIContainer;
