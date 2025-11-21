import React, { useState, useMemo } from 'react';
import { useProjectAnalytics } from '../../hooks/useAnalytics';
import { useAnalyticsStore } from '../../store/analyticsStore';

const ProjectTable: React.FC = () => {
    const { data: projects, isLoading } = useProjectAnalytics();
    const { filters } = useAnalyticsStore();
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredProjects = useMemo(() => {
        if (!projects) return [];

        // Ensure projects is an array
        const projectsArray = Array.isArray(projects) ? projects : [];
        let filtered = [...projectsArray];

        // Apply methodology filter
        if (filters.methodology.length > 0) {
            filtered = filtered.filter((p) =>
                filters.methodology.includes(p.methodology)
            );
        }

        // Apply status filter
        if (filters.status.length > 0) {
            filtered = filtered.filter((p) => filters.status.includes(p.status));
        }

        // Apply search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField as keyof typeof a];
            const bValue = b[sortField as keyof typeof b];

            // Handle undefined/null values
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [projects, filters, sortField, sortDirection]);

    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProjects, currentPage]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
                    }`}
            >
                {status}
            </span>
        );
    };

    const getHealthScoreBadge = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Project Performance</h2>
                <div className="text-sm text-gray-500">
                    Showing {paginatedProjects.length} of {filteredProjects.length} projects
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('methodology')}
                            >
                                Methodology {sortField === 'methodology' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('capacity')}
                            >
                                Capacity {sortField === 'capacity' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                NFTs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Health
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProjects.map((project) => (
                            <tr key={project._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {project.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {project.location.region}, {project.location.country}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.methodology}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(project.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.verifiedCapacity || project.capacity} tons
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.nftCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className={`h-2 rounded-full ${getHealthScoreBadge(
                                                    project.healthScore
                                                )}`}
                                                style={{ width: `${project.healthScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {project.healthScore}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                                        View
                                    </button>
                                    <button className="text-green-600 hover:text-green-900">
                                        Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {paginatedProjects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No projects found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </div>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ProjectTable;
