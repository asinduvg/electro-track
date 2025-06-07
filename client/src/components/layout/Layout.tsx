import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1 overflow-auto">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;