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
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card padding="md" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-none shadow-lg shadow-primary-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-white/90">+15% vs last month</span>
                            </div>
                            <div className="text-sm opacity-90 mb-1 font-medium">Total Credits Owned</div>
                            <div className="text-4xl font-bold mb-2 tracking-tight">1,250</div>
                            <div className="text-xs opacity-75 font-medium">≈ 1,250 Tons CO₂ Offset Potential</div>
                        </Card>

                        <Card padding="md" className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">+12 this month</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Credits Retired</div>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">450</div>
                            <div className="text-xs text-gray-500">Lifetime Impact Verified</div>
                        </Card>

                        <Card padding="md" className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Market Value</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Estimated Portfolio Value</div>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">$18,750</div>
                            <div className="text-xs text-gray-500">Based on current floor prices</div>
                        </Card>
                    </div>

                    {/* Holdings */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Holdings</h2>
                            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Download Report</button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold tracking-wider">Project</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider">Vintage</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider">Quantity</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {[
                                        {
                                            id: 1,
                                            name: "Rimba Raya Biodiversity Reserve",
                                            location: "Indonesia",
                                            type: "Forestry",
                                            vintage: 2021,
                                            quantity: 500,
                                            status: "Active",
                                            icon: "🌳",
                                            color: "bg-green-100 text-green-600 dark:bg-green-900/30"
                                        },
                                        {
                                            id: 2,
                                            name: "Keo Seima Wildlife Sanctuary",
                                            location: "Cambodia",
                                            type: "REDD+",
                                            vintage: 2022,
                                            quantity: 350,
                                            status: "Active",
                                            icon: "🐆",
                                            color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                                        },
                                        {
                                            id: 3,
                                            name: "Delta Blue Carbon Project",
                                            location: "Pakistan",
                                            type: "Blue Carbon",
                                            vintage: 2023,
                                            quantity: 400,
                                            status: "Retired",
                                            icon: "🌊",
                                            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                        },
                                        {
                                            id: 4,
                                            name: "Solar Power Project Gujarat",
                                            location: "India",
                                            type: "Renewable",
                                            vintage: 2024,
                                            quantity: 50,
                                            status: "Retired",
                                            icon: "☀️",
                                            color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                        }
                                    ].map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-lg shadow-sm`}>
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.location} • {item.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{item.vintage}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{item.quantity} Tons</td>
                                            <td className="px-6 py-4">
                                                <Badge 
                                                    variant={item.status === 'Active' ? 'success' : 'default'} 
                                                    size="sm" 
                                                    rounded
                                                    className={item.status === 'Retired' ? 'opacity-75' : ''}
                                                >
                                                    {item.status === 'Active' ? '🟢 Active' : '🔒 Retired'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'Active' ? (
                                                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
                                                        Retire Credits
                                                    </button>
                                                ) : (
                                                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-end gap-1 ml-auto">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        View Certificate
                                                    </button>
                                                )}
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
