import React from 'react';

export default function DiagnosticPanel({ functionName, recordsProcessed, executionTime, status = 'completed' }) {
  if (!functionName) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded p-3 text-xs mb-4 font-mono">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <div className="text-slate-400">Function</div>
          <div className="text-slate-100 font-semibold">{functionName}</div>
        </div>
        <div>
          <div className="text-slate-400">Records Processed</div>
          <div className="text-slate-100 font-semibold">{recordsProcessed?.toLocaleString() || 'N/A'}</div>
        </div>
        <div>
          <div className="text-slate-400">Execution Time</div>
          <div className="text-slate-100 font-semibold">{executionTime}ms</div>
        </div>
        <div>
          <div className="text-slate-400">Status</div>
          <div className={`font-semibold ${status === 'completed' ? 'text-green-400' : status === 'running' ? 'text-yellow-400' : 'text-red-400'}`}>
            {status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
