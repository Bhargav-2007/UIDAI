import React, { useState, useEffect } from 'react';
import ChartRenderer from '../components/ChartRenderer';
import {
  benfordsLaw,
  queueTheory,
  forecasting,
  paretoAnalysis
} from '../analyticsEngine';

export default function ExecutiveSummary() {
  const [kpis, setKpis] = useState({
    fraud: null,
    operations: null,
    forecast: null,
    pareto: null
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const executeAllAnalytics = async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      // Generate sample data
      const enrolmentData = Array(50000)
        .fill(0)
        .map(() => Math.floor(Math.random() * 100000000) + 10000000);
      
      const timeSeriesData = Array(24)
        .fill(0)
        .map(() => 100000 + Math.random() * 50000);

      // Execute all 4 KPI calculations in parallel
      const [fraudResult, opsResult, forecastResult, paretoResult] = await Promise.all([
        Promise.resolve(benfordsLaw(enrolmentData)),
        Promise.resolve(queueTheory(timeSeriesData)),
        Promise.resolve(forecasting(timeSeriesData)),
        Promise.resolve(paretoAnalysis(enrolmentData))
      ]);

      setKpis({
        fraud: fraudResult,
        operations: opsResult,
        forecast: forecastResult,
        pareto: paretoResult
      });

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error executing analytics:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    executeAllAnalytics();
    const interval = setInterval(executeAllAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Executive Summary</h1>
            <p className="text-slate-400">Real-time dashboard of key performance indicators</p>
          </div>
          <button
            onClick={executeAllAnalytics}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              loading
                ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Running...' : 'Execute All Analytics'}
          </button>
        </div>

        {lastUpdate && (
          <div className="text-xs text-slate-500 mb-6">
            Last updated: {lastUpdate}
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Fraud Risk Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600 hover:border-red-500 transition">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Fraud Risk Level</div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              {loading ? '-' : kpis.fraud?.metrics?.fraudRisk || 'LOW'}
            </div>
            <div className="text-xs text-slate-400">
              Chi-Square: {loading ? '-' : kpis.fraud?.metrics?.chiSquareStatistic || 'N/A'}
            </div>
          </div>

          {/* Operational Health Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600 hover:border-green-500 transition">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Operational Health</div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {loading ? '-' : (parseFloat(kpis.operations?.metrics?.utilization || 0) < 70 ? 'GOOD' : 'CAUTION')}
            </div>
            <div className="text-xs text-slate-400">
              Utilization: {loading ? '-' : kpis.operations?.metrics?.utilization || 'N/A'}
            </div>
          </div>

          {/* Forecast Trend Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600 hover:border-orange-500 transition">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Forecast Trend</div>
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {loading ? '-' : kpis.forecast?.metrics?.trend || 'NEUTRAL'}
            </div>
            <div className="text-xs text-slate-400">
              Rate: {loading ? '-' : kpis.forecast?.metrics?.trendRate || 'N/A'}
            </div>
          </div>

          {/* Pareto Vital Few Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600 hover:border-purple-500 transition">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Vital Few States</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {loading ? '-' : kpis.pareto?.metrics?.vitalFewStates || 'N/A'}
            </div>
            <div className="text-xs text-slate-400">
              Coverage: {loading ? '-' : kpis.pareto?.metrics?.vitalFewPercentage || 'N/A'}%
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {kpis.fraud?.chartData && (
            <ChartRenderer
              chartData={kpis.fraud.chartData}
              title="Fraud Detection - Benford's Law Analysis"
            />
          )}
          {kpis.operations?.chartData && (
            <ChartRenderer
              chartData={kpis.operations.chartData}
              title="Operational Efficiency - Queue Theory"
            />
          )}
          {kpis.forecast?.chartData && (
            <ChartRenderer
              chartData={kpis.forecast.chartData}
              title="Predictive Forecasting - 6-Month Outlook"
            />
          )}
          {kpis.pareto?.chartData && (
            <ChartRenderer
              chartData={kpis.pareto.chartData}
              title="Pareto Analysis - State Distribution"
            />
          )}
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-400">Fraud Alert</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {loading ? 'Loading...' : kpis.fraud?.insight || 'No fraud analysis available'}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Operations Status</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {loading ? 'Loading...' : kpis.operations?.insight || 'No operational analysis available'}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Forecast Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {loading ? 'Loading...' : kpis.forecast?.insight || 'No forecast available'}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Focus Areas</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {loading ? 'Loading...' : kpis.pareto?.insight || 'No Pareto analysis available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
