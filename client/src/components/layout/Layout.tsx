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
        <div className="flex h-screen bg-white dark:bg-[#222222]">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-[#222222] border-b border-[#EBEBEB] dark:border-[#484848] p-4 flex items-center">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#484848] transition-colors"
                    >
                        <Menu className="h-5 w-5 text-[#717171] dark:text-[#B0B0B0]" />
                    </button>
                </div>
                <div className="p-8 bg-white dark:bg-[#222222] min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;