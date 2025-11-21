import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import ThemeToggle from '../components/ui/ThemeToggle';
import Card from '../components/ui/Card';

const Portfolio: React.FC = () => {
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
                                    { label: 'Portfolio' },
                                ]}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    My Portfolio
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Manage your carbon credits and retirement history
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card padding="md" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-none">
                            <div className="text-sm opacity-90 mb-1">Total Credits Owned</div>
                            <div className="text-3xl font-bold mb-2">1,250</div>
                            <div className="text-xs opacity-75">≈ 1,250 Tons CO₂</div>
                        </Card>
                        <Card padding="md" className="bg-white dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credits Retired</div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">450</div>
                            <div className="text-xs text-green-500">+12 this month</div>
                        </Card>
                        <Card padding="md" className="bg-white dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Value</div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$18,750</div>
                            <div className="text-xs text-gray-400">Based on current market price</div>
                        </Card>
                    </div>

                    {/* Holdings */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Holdings</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Project</th>
                                        <th className="px-6 py-4 font-medium">Vintage</th>
                                        <th className="px-6 py-4 font-medium">Quantity</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {[1, 2, 3].map((item) => (
                                        <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center text-green-600">
                                                        🌳
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white text-sm">Amazon Reforestation</div>
                                                        <div className="text-xs text-gray-500">ID: #84729</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2023</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">500 Tons</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="success" size="sm" rounded>Active</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                                    Retire
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Portfolio;
