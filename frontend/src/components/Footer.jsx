import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#002147] text-white py-12 px-8 mt-auto border-t-4 border-[#c5a059]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-white text-[#002147] rounded flex items-center justify-center font-serif font-bold">U</div>
                        <h3 className="font-serif text-xl font-bold">UIDAI Analytics Store</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                        Providing audit-grade analytical insights into the world's largest biometric identity system.
                        Ensuring data integrity, operational efficiency, and predictive foresights for national development.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#c5a059] mb-6">Government Portals</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-white transition-colors">National Portal of India</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Digital India</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">MeitY</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Data.gov.in</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#c5a059] mb-6">Security & Compliance</h4>
                    <p className="text-xs text-slate-500 mb-4">
                        All data shown here is aggregated or simulated for analytical demonstration.
                        No Personally Identifiable Information (PII) is exposed.
                    </p>
                    <div className="flex gap-4">
                        <div className="px-2 py-1 border border-slate-700 rounded text-[10px] font-mono text-slate-500">AES-256</div>
                        <div className="px-2 py-1 border border-slate-700 rounded text-[10px] font-mono text-slate-500">FIPS 140-2</div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>© 2026 Unique Identification Authority of India (UIDAI). All Rights Reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                    <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
