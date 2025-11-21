import React from 'react';
import CountUp from 'react-countup';
import { useOverviewMetrics } from '../../hooks/useAnalytics';

const MetricsCards: React.FC = () => {
    const { data: metrics, isLoading } = useOverviewMetrics();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Credits',
            value: metrics?.totalCredits || 0,
            suffix: ' tons',
            icon: '🌍',
            gradient: 'from-primary-400 to-primary-600',
            trend: '+12.5%',
        },
        {
            title: 'Active Projects',
            value: metrics?.activeProjects || 0,
            suffix: '',
            icon: '🌱',
            gradient: 'from-secondary-400 to-secondary-600',
            trend: '+8.2%',
        },
        {
            title: 'NFTs Minted',
            value: metrics?.totalNFTs || 0,
            suffix: '',
            icon: '🎨',
            gradient: 'from-purple-400 to-purple-600',
            trend: '+15.3%',
        },
        {
            title: 'Credits Retired',
            value: metrics?.totalRetired || 0,
            suffix: ' tons',
            icon: '♻️',
            gradient: 'from-orange-400 to-orange-600',
            trend: '+10.1%',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                    {/* Content */}
                    <div className="relative p-5 text-white">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl">{card.icon}</div>
                            <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                                {card.trend}
                            </div>
                        </div>

                        <div className="text-2xl font-bold mb-1">
                            <CountUp
                                end={card.value}
                                duration={2}
                                separator=","
                                suffix={card.suffix}
                            />
                        </div>

                        <div className="text-white/90 text-sm font-medium">
                            {card.title}
                        </div>
                    </div>

                    {/* Decorative Circle */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            ))}
        </div>
    );
};

export default MetricsCards;