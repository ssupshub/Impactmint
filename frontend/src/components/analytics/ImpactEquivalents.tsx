import React from 'react';
import { motion } from 'framer-motion';
import { useOverviewMetrics } from '../../hooks/useAnalytics';

const ImpactEquivalents: React.FC = () => {
    const { data: metrics } = useOverviewMetrics();

    const calculateEquivalents = (tonsCO2: number) => {
        return {
            treesPlanted: Math.round(tonsCO2 * 30),
            carsOffRoad: (tonsCO2 / 4.6).toFixed(1),
            homesPowered: (tonsCO2 / 7).toFixed(1),
            milesSaved: Math.round(tonsCO2 * 2500),
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
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">
                Environmental Impact Equivalents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                            {item.value}
                        </div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {item.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ImpactEquivalents;
