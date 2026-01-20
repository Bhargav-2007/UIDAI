import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const PageShell = ({ children, activeModule, onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#fcfaf5] flex flex-col font-sans">
            <Header />

            <div className="flex flex-1 pt-16">
                <Sidebar activeModule={activeModule} onNavigate={onNavigate} />

                <main className="flex-1 pl-64 min-h-[calc(100vh-64px)] flex flex-col">
                    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default PageShell;
