import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useSettings } from '../../context/SettingsContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { companyName } = useSettings();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;