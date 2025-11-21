import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api.service';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MethodologyChart: React.FC = () => {
    const { data: methodologyData, isLoading } = useQuery({
        queryKey: ['analytics', 'methodology'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getMethodology();
            return data;
        },
    });

    const pieData = useMemo(() => {
        if (!methodologyData) return null;

        // Ensure methodologyData is an array
        const dataArray = Array.isArray(methodologyData) ? methodologyData : [];
        if (dataArray.length === 0) return null;

        return {
            labels: dataArray.map((m: any) => m.methodology),
            datasets: [
                {
                    label: 'Projects by Methodology',
                    data: dataArray.map((m: any) => m.projectCount),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)', // Blue for REC
                        'rgba(34, 197, 94, 0.8)', // Green for REDD
                        'rgba(245, 158, 11, 0.8)', // Orange for OPR
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(34, 197, 94)',
                        'rgb(245, 158, 11)',
                    ],
                    borderWidth: 2,
                },
            ],
        };
    }, [methodologyData]);

    const barData = useMemo(() => {
        if (!methodologyData) return null;

        // Ensure methodologyData is an array
        const dataArray = Array.isArray(methodologyData) ? methodologyData : [];
        if (dataArray.length === 0) return null;

        return {
            labels: dataArray.map((m: any) => m.methodology),
            datasets: [
                {
                    label: 'Total Capacity (tons)',
                    data: dataArray.map((m: any) => m.totalCapacity || 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                },
                {
                    label: 'Verified Capacity (tons)',
                    data: dataArray.map((m: any) => m.verifiedCapacity || 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                },
            ],
        };
    }, [methodologyData]);

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: 'Projects by Methodology',
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Capacity Comparison',
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

    if (isLoading || !pieData || !barData) {
        return (
            <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                    <Pie data={pieData} options={pieOptions} />
                </div>
                <div className="h-80">
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>

            {/* Statistics Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Methodology
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Projects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                NFTs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg Capacity
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(methodologyData) && methodologyData.length > 0 ? (
                            methodologyData.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.methodology}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.projectCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.nftCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.avgCapacity?.toFixed(2)} tons
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No methodology data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MethodologyChart;
