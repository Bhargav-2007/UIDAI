import React, { useState } from 'react';
import ChartRenderer from '../components/ChartRenderer';
import DiagnosticPanel from '../components/DiagnosticPanel';
import BeforeAfterToggle from '../components/BeforeAfterToggle';
import {
  clusterAnalysis,
  genderParityAnalysis,
  descriptiveStatistics
} from '../analyticsEngine';

export default function GeographicModuleNew() {
  const [activeView, setActiveView] = useState('before');
  const [selectedTechnique, setSelectedTechnique] = useState('clusters');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [rawData, setRawData] = useState([]);

  const techniques = {
    clusters: {
      name: 'Cluster Analysis',
      desc: 'Geographic zone identification',
      icon: 'C',
      fn: clusterAnalysis
    },
    gender: {
      name: 'Gender Parity',
      desc: 'Demographic distribution analysis',
      icon: 'G',
      fn: genderParityAnalysis
    },
    descriptive: {
      name: 'Descriptive Stats',
      desc: 'Distribution and summary statistics',
      icon: 'S',
      fn: descriptiveStatistics
    }
  };

  const handleExecute = async (techniqueKey) => {
    setLoading(true);
    setActiveView('after');
    const startTime = performance.now();

    try {
      // Simulate real data loading
      const sampleData = Array(50000)
        .fill(0)
        .map(() => Math.floor(Math.random() * 100000000) + 10000000);
      setRawData(sampleData.slice(0, 100));

      // Execute analytics function
      const techniqueFunc = techniques[techniqueKey].fn;
      const analysisResult = techniqueFunc(sampleData);

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResult({
        technique: techniqueKey,
        data: analysisResult,
        recordsProcessed: sampleData.length
      });
    } catch (error) {
      console.error('Analysis error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Geographic & Demographic</h1>
          <p className="text-slate-400">Cluster identification and demographic distribution analysis</p>
        </div>

        {/* Technique Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(techniques).map(([key, tech]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTechnique(key);
                handleExecute(key);
              }}
              disabled={loading}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedTechnique === key
                  ? 'border-purple-500 bg-slate-800'
                  : 'border-slate-600 bg-slate-800 hover:border-slate-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl mb-2">{tech.icon}</div>
              <div className="font-semibold text-sm">{tech.name}</div>
              <div className="text-xs text-slate-400 mt-1">{tech.desc}</div>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        {result && <BeforeAfterToggle view={activeView} onToggle={setActiveView} />}

        {/* Content Area */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-slate-400 mt-4">Executing {techniques[selectedTechnique].name}...</p>
          </div>
        )}

        {activeView === 'before' && !loading && result && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Raw Data Sample</h3>
            <div className="max-h-96 overflow-y-auto text-xs font-mono text-slate-300">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-600">
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Enrolment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.map((val, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="p-2 text-slate-400">{idx + 1}</td>
                      <td className="p-2">{val.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'after' && !loading && result && (
          <div className="space-y-6">
            {/* Diagnostic Panel */}
            <DiagnosticPanel
              functionName={techniques[result.technique].name}
              recordsProcessed={result.recordsProcessed}
              executionTime={executionTime}
              status="completed"
            />

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(result.data.metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition"
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mt-2">{value}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            {result.data.chartData && (
              <ChartRenderer
                chartData={result.data.chartData}
                title={`${techniques[result.technique].name} - Geographic Distribution`}
              />
            )}

            {/* Insight */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Geographic Insight</div>
              <div className="text-slate-100">{result.data.insight}</div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-12 text-slate-400">
            Click any technique above to execute real-time geographic analysis
          </div>
        )}
      </div>
    </div>
  );
}
