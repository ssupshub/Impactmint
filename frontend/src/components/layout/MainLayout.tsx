import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div 
                className={`transition-all duration-300 ${
                    isSidebarOpen ? 'pl-64' : 'pl-20'
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
