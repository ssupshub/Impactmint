import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import ThemeToggle from '../components/ui/ThemeToggle';
import MetricsCards from '../components/analytics/MetricsCards';
import ImpactEquivalents from '../components/analytics/ImpactEquivalents';
import TimeSeriesChart from '../components/analytics/TimeSeriesChart';
import MethodologyChart from '../components/analytics/MethodologyChart';
import ProjectMap from '../components/analytics/ProjectMap';
import ProjectTable from '../components/analytics/ProjectTable';
import TransactionExplorer from '../components/analytics/TransactionExplorer';

const Dashboard: React.FC = () => {
    useWebSocket();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Sidebar />

            <div className="pl-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
                    <div className="px-6 py-4">
                        <div className="mb-3">
                            <Breadcrumb
                                items={[
                                    { label: 'Home', href: '/' },
                                    { label: 'Dashboard' },
                                ]}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Carbon Offset Analytics
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Real-time insights into environmental impact
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <Badge variant="success" size="md" rounded>
                                    🟢 Live
                                </Badge>
                                <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm rounded-lg hover:from-primary-600 hover:to-primary-700 transition shadow-md hover:shadow-lg">
                                    Export Report
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6 space-y-6">
                    {/* Hero Metrics */}
                    <div className="animate-fade-in">
                        <MetricsCards />
                    </div>

                    {/* Impact Equivalents */}
                    <div className="animate-fade-in">
                        <ImpactEquivalents />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        <TimeSeriesChart />
                        <MethodologyChart />
                    </div>

                    {/* Map */}
                    <div className="animate-fade-in">
                        <ProjectMap />
                    </div>

                    {/* Project Table */}
                    <div className="animate-fade-in">
                        <ProjectTable />
                    </div>

                    {/* Transaction Explorer */}
                    <div className="animate-fade-in">
                        <TransactionExplorer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;