import React from 'react';

const TechniqueCard = ({ title, description, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-300 relative overflow-hidden group ${isActive
                    ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }`}
        >
            {isActive && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                </div>
            )}

            <h3 className={`font-semibold text-lg mb-2 ${isActive ? 'text-blue-400' : 'text-slate-200'}`}>
                {title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
                {description}
            </p>

            <div className={`mt-3 text-xs font-medium uppercase tracking-wider flex items-center ${isActive ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                View Methodology <span className="ml-1">→</span>
            </div>
        </button>
    );
};

export default TechniqueCard;
