import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-8 justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#002147] rounded flex items-center justify-center text-white font-serif text-xl border-b-2 border-[#c5a059]">
                    U
                </div>
                <div>
                    <h1 className="font-serif text-xl font-bold text-[#002147] leading-none">UIDAI Analytics Store</h1>
                    <p className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mt-1">National Data & Analytics Portal</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#002147]">
                    <a href="/" className="hover:text-[#c5a059] transition-colors">Dashboard</a>
                    <a href="/docs" className="hover:text-[#c5a059] transition-colors">Documentation</a>
                    <a href="/support" className="hover:text-[#c5a059] transition-colors">Support</a>
                </nav>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-[#002147]">Administrator</p>
                        <p className="text-[10px] text-slate-500">Secure Node 42</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#002147] font-bold text-xs">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
