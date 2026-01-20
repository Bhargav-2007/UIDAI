import React from 'react';

interface BeforeAfterToggleProps {
  value: 'before' | 'after';
  onChange: (value: 'before' | 'after') => void;
}

export default function BeforeAfterToggle({ value, onChange }: BeforeAfterToggleProps) {
  return (
    <div className="relative group">
      {/* Enhanced background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
        <button
          onClick={() => onChange('before')}
          className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
            value === 'before'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Historical</span>
          </div>
          {value === 'before' && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl opacity-20 animate-pulse"></div>
          )}
        </button>
        
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1.5"></div>
        
        <button
          onClick={() => onChange('after')}
          className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
            value === 'after'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI-Enhanced</span>
          </div>
          {value === 'after' && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 animate-pulse"></div>
          )}
        </button>
      </div>
    </div>
  );
}
