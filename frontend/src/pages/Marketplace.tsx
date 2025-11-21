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
                        {[
                            {
                                id: 101,
                                name: "Amazon Rainforest Protection",
                                location: "Brazil",
                                type: "Forestry",
                                vintage: 2023,
                                price: 150,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
                                verified: true,
                                badge: "Best Seller"
                            },
                            {
                                id: 102,
                                name: "Solar Power Project Gujarat",
                                location: "India",
                                type: "Renewable Energy",
                                vintage: 2024,
                                price: 45,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                                verified: true,
                                badge: "New"
                            },
                            {
                                id: 103,
                                name: "Blue Carbon Mangrove Restoration",
                                location: "Kenya",
                                type: "Blue Carbon",
                                vintage: 2022,
                                price: 210,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                                verified: true,
                                badge: "Premium"
                            },
                            {
                                id: 104,
                                name: "Clean Cookstoves Initiative",
                                location: "Rwanda",
                                type: "Community",
                                vintage: 2023,
                                price: 85,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                                verified: true,
                                badge: null
                            },
                            {
                                id: 105,
                                name: "Wind Farm Expansion",
                                location: "Turkey",
                                type: "Renewable Energy",
                                vintage: 2024,
                                price: 55,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                                verified: true,
                                badge: "Trending"
                            },
                            {
                                id: 106,
                                name: "Peatland Conservation",
                                location: "Indonesia",
                                type: "Forestry",
                                vintage: 2021,
                                price: 120,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #3f6212 0%, #65a30d 100%)",
                                verified: true,
                                badge: null
                            },
                            {
                                id: 107,
                                name: "Biogas Capture Project",
                                location: "Vietnam",
                                type: "Methane Capture",
                                vintage: 2023,
                                price: 95,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                                verified: true,
                                badge: null
                            },
                            {
                                id: 108,
                                name: "Reforestation & Biodiversity",
                                location: "Costa Rica",
                                type: "Forestry",
                                vintage: 2024,
                                price: 180,
                                currency: "HBAR",
                                image: "linear-gradient(135deg, #15803d 0%, #4ade80 100%)",
                                verified: true,
                                badge: "Rare"
                            }
                        ].map((item) => (
                            <Card key={item.id} hover padding="none" className="flex flex-col h-full overflow-hidden border border-gray-100 dark:border-gray-800 group">
                                <div 
                                    className="h-40 relative overflow-hidden"
                                    style={{ background: item.image }}
                                >
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                                    
                                    {item.badge && (
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white bg-black/30 backdrop-blur-md rounded border border-white/10">
                                                {item.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2">
                                        <Badge variant="info" size="sm" rounded className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/50">
                                            NFT
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-900/30">
                                            VCS Verified
                                        </span>
                                        <span className="text-[10px] text-gray-500 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
                                            Vintage {item.vintage}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-primary-500 transition-colors">
                                        {item.name}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                        {item.location} • {item.type}
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Price</div>
                                            <div className="text-base font-bold text-gray-900 dark:text-white">
                                                {item.price} <span className="text-xs font-normal text-gray-500">{item.currency}</span>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-primary-600 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                            Buy Now
                                        </button>
                                    </div>
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
