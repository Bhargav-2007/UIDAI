import React from 'react';

export default function BeforeAfterToggle({ view, onToggle }) {
  return (
    <div className="flex items-center gap-2 mb-4 bg-slate-800 p-2 rounded border border-slate-600 w-fit">
      <button
        onClick={() => onToggle('before')}
        className={`px-3 py-1 rounded text-sm font-semibold transition ${
          view === 'before'
            ? 'bg-slate-600 text-slate-100'
            : 'bg-slate-700 text-slate-400 hover:text-slate-100'
        }`}
      >
        BEFORE: Raw
      </button>
      <div className="w-px h-6 bg-slate-600"></div>
      <button
        onClick={() => onToggle('after')}
        className={`px-3 py-1 rounded text-sm font-semibold transition ${
          view === 'after'
            ? 'bg-slate-600 text-slate-100'
            : 'bg-slate-700 text-slate-400 hover:text-slate-100'
        }`}
      >
        AFTER: Analysis
      </button>
    </div>
  );
}
