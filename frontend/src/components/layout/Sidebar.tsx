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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ImpactMint
                </h1>
                <p className="text-sm text-gray-500 mt-1">Carbon Offset Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">User</div>
                        <div className="text-xs text-gray-500">View Profile</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
