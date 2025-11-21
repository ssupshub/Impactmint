import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import ThemeToggle from '../components/ui/ThemeToggle';
import Card from '../components/ui/Card';

const Marketplace: React.FC = () => {
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
                                    { label: 'Marketplace' },
                                ]}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Carbon Credit Marketplace
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Buy and sell verified carbon credits as NFTs
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg hover:opacity-90 transition shadow-md">
                                    Connect Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    {/* Filters */}
                    <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                        {['All', 'Forestry', 'Renewable Energy', 'Methane Capture', 'Blue Carbon'].map((filter, i) => (
                            <button
                                key={filter}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                    i === 0
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <Card key={item} hover padding="sm" className="flex flex-col h-full">
                                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 relative">
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="info" size="sm" rounded>NFT</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                                        VCS Verified
                                    </span>
                                    <span className="text-xs text-gray-500">Vintage 2024</span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 truncate">
                                    Amazon Rainforest Protection
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Brazil • Forestry
                                </p>
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500">Price</div>
                                        <div className="text-base font-bold text-gray-900 dark:text-white">150 HBAR</div>
                                    </div>
                                    <button className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition">
                                        Buy Now
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

export default Marketplace;
