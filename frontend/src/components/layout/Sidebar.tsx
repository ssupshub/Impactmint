import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation();

    const navItems = [
        { 
            path: '/', 
            label: 'Home', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        { 
            path: '/dashboard', 
            label: 'Dashboard', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        { 
            path: '/projects', 
            label: 'Projects', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        },
        { 
            path: '/marketplace', 
            label: 'Marketplace', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        { 
            path: '/portfolio', 
            label: 'Portfolio', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
    ];

    return (
        <aside 
            className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-16'
            }`}
        >
            {/* Header */}
            <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 ${isOpen ? 'justify-between' : 'justify-center'}`}>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                            ImpactMint
                        </span>
                    </div>
                )}
                <button 
                    onClick={onToggle}
                    className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center py-2.5 rounded-xl transition-all duration-200 group relative ${
                                isActive
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            } ${isOpen ? 'px-4' : 'justify-center px-2'}`}
                            title={!isOpen ? item.label : undefined}
                        >
                            <span className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            
                            {isOpen && (
                                <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden">
                                    {item.label}
                                </span>
                            )}

                            {/* Active Indicator Strip */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white shadow-md ring-2 ring-white dark:ring-gray-800 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                Demo User
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                view profile
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
