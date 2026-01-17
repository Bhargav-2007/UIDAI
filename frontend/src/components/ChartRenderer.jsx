import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ScatterController,
  Legend,
  Tooltip,
  Title,
  Filler
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ScatterController,
  Legend,
  Tooltip,
  Title,
  Filler
);

export default function ChartRenderer({ chartData, chartType = 'bar', title = '' }) {
  if (!chartData || !chartData.labels) {
    return <div className="p-4 text-slate-400">No chart data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: { size: 14, weight: 'bold' }
      },
      legend: {
        position: 'top',
        labels: { color: '#e2e8f0', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        callbacks: {
          label: (context) => {
            if (typeof context.parsed.y === 'number') {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: '#334155', drawBorder: false }
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: '#334155', drawBorder: false }
      }
    }
  };

  // Detect chart type from data structure
  const hasLineDatasets = chartData.datasets?.some(d => d.borderColor && !d.type?.includes('bar'));
  const hasBarDatasets = chartData.datasets?.some(d => d.backgroundColor && d.type !== 'line');
  const detectedType = hasBarDatasets && !hasLineDatasets ? 'bar' : hasLineDatasets ? 'line' : chartType;

  return (
    <div className="w-full bg-slate-800 rounded-lg p-4 border border-slate-700">
      {detectedType === 'bar' && <Bar data={chartData} options={options} />}
      {detectedType === 'line' && <Line data={chartData} options={options} />}
      {detectedType === 'scatter' && <Scatter data={chartData} options={options} />}
    </div>
  );
}
