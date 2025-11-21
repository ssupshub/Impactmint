import React from 'react';
import CountUp from 'react-countup';
import { useOverviewMetrics } from '../../hooks/useAnalytics';
import Card from '../ui/Card';

const MetricsCards: React.FC = () => {
    const { data: metrics, isLoading } = useOverviewMetrics();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
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
            gradient: 'from-green-400 to-green-600',
            trend: '+12.5%',
        },
        {
            title: 'Active Projects',
            value: metrics?.totalProjects || 0,
            suffix: '',
            icon: '🌱',
            gradient: 'from-blue-400 to-blue-600',
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
                    className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                    {/* Content */}
                    <div className="relative p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{card.icon}</div>
                            <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                                {card.trend}
                            </div>
                        </div>

                        <div className="text-3xl font-bold mb-1">
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
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            ))}
        </div>
    );
};

export default MetricsCards;