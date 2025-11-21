import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import ThemeToggle from '../components/ui/ThemeToggle';
import Card from '../components/ui/Card';

const Projects: React.FC = () => {
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
                                    { label: 'Projects' },
                                ]}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Carbon Offset Projects
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Explore and support verified environmental projects
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <Badge variant="success" size="md" rounded>
                                    Verified
                                </Badge>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <Card key={item} hover padding="md" className="flex flex-col h-full">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 relative overflow-hidden">
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="success" size="sm" rounded>Active</Badge>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Reforestation Project #{item}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                                    Restoring native forest ecosystems in the Amazon region to sequester carbon and support biodiversity.
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <div className="text-xs text-gray-500">Price per ton</div>
                                        <div className="text-lg font-bold text-primary-600">$15.00</div>
                                    </div>
                                    <button className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition">
                                        View Details
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Projects;
