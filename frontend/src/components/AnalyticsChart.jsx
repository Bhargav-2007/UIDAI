import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Scatter, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AnalyticsChart({ type, data, options }) {
    if (!data) return <div className="p-4 text-center text-gray-500">Loading analytics...</div>;

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                },
            },
        },
        ...options
    };

    const containerStyle = { position: 'relative', height: '300px', width: '100%' };

    return (
        <div style={containerStyle}>
            {(() => {
                switch (type) {
                    case "line": return <Line data={data} options={defaultOptions} />;
                    case "bar": return <Bar data={data} options={defaultOptions} />;
                    case "scatter": return <Scatter data={data} options={defaultOptions} />;
                    case "pie": return <Pie data={data} options={defaultOptions} />;
                    default: return <p>Unsupported chart type: {type}</p>;
                }
            })()}
        </div>
    );
}
