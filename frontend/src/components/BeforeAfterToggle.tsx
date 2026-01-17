import React from 'react';

interface BeforeAfterToggleProps {
  value: 'before' | 'after';
  onChange: (value: 'before' | 'after') => void;
}

export default function BeforeAfterToggle({ value, onChange }: BeforeAfterToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-4 bg-slate-800 p-2 rounded border border-slate-600 w-fit">
      <button
        onClick={() => onChange('before')}
        className={`px-3 py-1 rounded text-sm font-semibold transition ${
          value === 'before'
            ? 'bg-slate-600 text-slate-100'
            : 'bg-slate-700 text-slate-400 hover:text-slate-100'
        }`}
      >
        Before
      </button>
      <div className="w-px h-6 bg-slate-600"></div>
      <button
        onClick={() => onChange('after')}
        className={`px-3 py-1 rounded text-sm font-semibold transition ${
          value === 'after'
            ? 'bg-slate-600 text-slate-100'
            : 'bg-slate-700 text-slate-400 hover:text-slate-100'
        }`}
      >
        After
      </button>
    </div>
  );
}
