import React from 'react';
import { motion } from 'framer-motion';
import { useOverviewMetrics } from '../../hooks/useAnalytics';

const ImpactEquivalents: React.FC = () => {
    const { data: metrics } = useOverviewMetrics();

    const calculateEquivalents = (tonsCO2: number) => {
        return {
            treesPlanted: Math.round(tonsCO2 * 30), // 1 ton = 30 trees
            carsOffRoad: (tonsCO2 / 4.6).toFixed(1), // 1 car = 4.6 tons/year
            homesPowered: (tonsCO2 / 7).toFixed(1), // 1 home = 7 tons/year
            milesSaved: Math.round(tonsCO2 * 2500), // 1 ton = 2,500 miles
        };
    };

    const equivalents = calculateEquivalents(metrics?.totalTonsCO2 || 0);

    const items = [
        {
            icon: '🌳',
            value: equivalents.treesPlanted.toLocaleString(),
            label: 'Trees Planted',
            description: 'Equivalent trees absorbing CO₂',
        },
        {
            icon: '🚗',
            value: equivalents.carsOffRoad,
            label: 'Cars Off Road',
            description: 'For one year',
        },
        {
            icon: '🏠',
            value: equivalents.homesPowered,
            label: 'Homes Powered',
            description: 'Annual electricity usage',
        },
        {
            icon: '🛣️',
            value: equivalents.milesSaved.toLocaleString(),
            label: 'Miles Saved',
            description: 'Driving distance equivalent',
        },
    ];

    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Environmental Impact Equivalents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                        <motion.div
                            className="text-5xl mb-3"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            {item.icon}
                        </motion.div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {item.value}
                        </div>
                        <div className="text-lg font-semibold text-gray-800 mb-1">
                            {item.label}
                        </div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ImpactEquivalents;
