import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTimelineData } from '../../hooks/useAnalytics';
import { format } from 'date-fns';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);
const TimeSeriesChart: React.FC = () => {
    const { data: timeline, isLoading } = useTimelineData(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        new Date()
    );
    const chartData = useMemo(() => {
        if (!timeline) return null;
        return {
            labels: timeline.map((d) => format(new Date(d.date), 'MMM yyyy')),
            datasets: [
                {
                    label: 'Cumulative CO₂ Offset',
                    data: timeline.map((d) => d.cumulative),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Monthly CO₂ Offset',
                    data: timeline.map((d) => d.total),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false,
                    tension: 0.4,
                },
            ],
        };
    }, [timeline]);
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Carbon Offset Timeline',
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} tons`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Tons CO₂',
                },
            },
        },
    };
    if (isLoading || !chartData) {
        return (
            <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="h-96">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};
export default TimeSeriesChart;