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
        <div className="flex items-center border-b border-[#EBEBEB] bg-white p-4 dark:border-[#484848] dark:bg-[#222222]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[#484848]"
          >
            <Menu className="h-5 w-5 text-[#717171] dark:text-[#B0B0B0]" />
          </button>
        </div>
        <div className="min-h-full bg-white p-8 dark:bg-[#222222]">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
