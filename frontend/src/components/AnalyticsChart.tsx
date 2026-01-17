import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import { ChartData, KPI } from '../types/analytics';
import './AnalyticsChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  chartType: 'line' | 'bar' | 'scatter' | 'pie';
  data: ChartData;
  title: string;
  kpis: KPI[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

/**
 * Universal Chart Component
 * Renders different chart types (line, bar, scatter, pie) based on chartType prop
 * Displays KPIs alongside the chart
 * Handles loading and error states
 */
export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  chartType,
  data,
  title,
  kpis,
  isLoading = false,
  error,
  onRetry,
}) => {
  // Validate data
  if (!data || !data.labels || !data.datasets || 
      !Array.isArray(data.labels) || !Array.isArray(data.datasets) ||
      data.labels.length === 0 || data.datasets.length === 0) {
    return (
      <div className="analytics-chart-container error-state">
        <div className="error-message">
          <p>Invalid chart data provided</p>
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="analytics-chart-container error-state">
        <div className="error-message">
          <p>{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="analytics-chart-container loading-state">
        <div className="loading-indicator">
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Format KPI value based on format type
  const formatKpiValue = (kpi: KPI): string => {
    if (typeof kpi.value === 'string') {
      return kpi.value;
    }

    switch (kpi.format) {
      case 'percentage':
        return `${kpi.value.toFixed(2)}%`;
      case 'currency':
        return `$${kpi.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'number':
      default:
        return kpi.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: chartType === 'pie' ? {} : {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Render appropriate chart based on chartType
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'scatter':
        return <Scatter data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="analytics-chart-container">
      <div className="chart-wrapper">
        <div className="kpis-section">
          {kpis.map((kpi, index) => (
            <div key={index} className="kpi-card">
              <div className="kpi-label" data-testid={`kpi-label-${index}`}>{kpi.label}</div>
              <div className="kpi-value" data-testid={`kpi-value-${index}`}>{formatKpiValue(kpi)}</div>
            </div>
          ))}
        </div>
        <div className="chart-section">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
