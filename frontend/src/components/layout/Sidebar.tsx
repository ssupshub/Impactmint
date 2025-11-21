import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/projects', label: 'Projects', icon: '🌱' },
        { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
        { path: '/portfolio', label: 'Portfolio', icon: '💼' },
    ];

    return (
        <aside 
            className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col transition-all duration-300 ${
                isOpen ? 'w-64' : 'w-20'
            }`}
        >
            {/* Logo & Toggle */}
            <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} border-b border-gray-200 dark:border-gray-700 h-20`}>
                {isOpen && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-xl font-bold gradient-text">
                            ImpactMint
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbon Offset Platform</p>
                    </div>
                )}
                <button 
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center ${isOpen ? 'px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                            title={!isOpen ? item.label : undefined}
                        >
                            <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>{item.icon}</span>
                            {isOpen && (
                                <span className="font-medium text-sm tracking-wide ml-3 whitespace-nowrap overflow-hidden">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        U
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-medium text-xs truncate dark:text-white">User</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">View Profile</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
