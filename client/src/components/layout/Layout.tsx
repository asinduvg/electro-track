import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;