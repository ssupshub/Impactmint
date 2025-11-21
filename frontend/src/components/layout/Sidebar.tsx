import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/projects', label: 'Projects', icon: '🌱' },
        { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
        { path: '/portfolio', label: 'Portfolio', icon: '💼' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col transition-colors">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold gradient-text">
                    ImpactMint
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbon Offset Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                        >
                            <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>{item.icon}</span>
                            <span className="font-medium text-sm tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate dark:text-white">User</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">View Profile</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
