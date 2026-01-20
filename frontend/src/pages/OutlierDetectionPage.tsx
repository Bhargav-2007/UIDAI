import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData, ApiError } from '../types/analytics';
import AnalyticsChart from '../components/AnalyticsChartNew';
import BeforeAfterToggle from '../components/BeforeAfterToggle';

export default function OutlierDetectionPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggleValue, setToggleValue] = useState<'before' | 'after'>('after');

    const fetchData = async (before?: boolean) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyticsApi.getOutlierDetection(before);
            setData(result);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load Outlier Detection data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleChange = (value: 'before' | 'after') => {
        setToggleValue(value);
        fetchData(value === 'before');
    };

    const handleRetry = () => fetchData(toggleValue === 'before');

    useEffect(() => { fetchData(false); }, []);

    return (
        <div className="flex flex-col gap-8 fade-in">
            <div className="flex justify-between items-end border-b border-[#002147]/10 pb-6">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-[#002147] mb-2">Outlier Detection</h2>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Statistical Identification of Unusual Enrolment Clusters</p>
                </div>
                <BeforeAfterToggle value={toggleValue} onChange={handleToggleChange} />
            </div>

            <div className="bg-white border border-[#002147]/10 rounded shadow-sm p-8">
                <AnalyticsChart
                    chartType={data?.chartType || 'bar'}
                    data={{ labels: data?.labels || [], datasets: data?.datasets || [] }}
                    title={data?.title || 'Outlier Detection'}
                    kpis={data?.kpis || []}
                    isLoading={isLoading}
                    error={error || undefined}
                    onRetry={handleRetry}
                />
            </div>
        </div>
    );
}
