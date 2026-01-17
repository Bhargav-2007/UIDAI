import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData, ApiError } from '../types/analytics';
import AnalyticsChart from '../components/AnalyticsChart';
import BeforeAfterToggle from '../components/BeforeAfterToggle';

/**
 * Executive Summary Page Component
 * Displays executive summary analytics with line chart and KPIs
 * Supports Before/After toggle for data comparison
 */
export default function ExecutiveSummaryPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleValue, setToggleValue] = useState<'before' | 'after'>('after');

  /**
   * Fetch executive summary data from API
   */
  const fetchData = async (before?: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyticsApi.getExecutiveSummary(before);
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load Executive Summary data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Before/After toggle change
   */
  const handleToggleChange = (value: 'before' | 'after') => {
    setToggleValue(value);
    fetchData(value === 'before');
  };

  /**
   * Handle retry button click
   */
  const handleRetry = () => {
    fetchData(toggleValue === 'before');
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData(false); // Default to "after" data
  }, []);

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Executive Summary</h1>
            <p className="text-slate-400">Key performance indicators and trends overview</p>
          </div>
        </div>

        {/* Before/After Toggle */}
        <BeforeAfterToggle 
          value={toggleValue} 
          onChange={handleToggleChange} 
        />

        {/* Analytics Chart */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <AnalyticsChart
            chartType={data?.chartType || 'line'}
            data={{
              labels: data?.labels || [],
              datasets: data?.datasets || []
            }}
            title={data?.title || 'Executive Summary'}
            kpis={data?.kpis || []}
            isLoading={isLoading}
            error={error || undefined}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  );
}