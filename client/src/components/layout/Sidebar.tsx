import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    MapPin, 
    Users, 
    BarChart3, 
    Settings,
    LogOut,
    Cpu,
    Zap,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const { companyName } = useSettings();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Components', href: '/inventory/items', icon: Package },
        { name: 'Storage', href: '/locations', icon: MapPin },
        { name: 'Team', href: '/users', icon: Users },
        { name: 'Analytics', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-[#222222] text-[#222222] dark:text-white shadow-lg border-r border-[#EBEBEB] dark:border-[#484848] transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-72'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#EBEBEB] dark:border-[#484848]">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Cpu className="h-8 w-8 text-[#FF385C]" />
                            <Zap className="h-4 w-4 text-[#FC642D] absolute -top-1 -right-1" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#FF385C]">
                                {companyName}
                            </h1>
                            <p className="text-xs text-[#717171] font-medium">Component Management</p>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex items-center justify-center w-full">
                        <div className="relative">
                            <Cpu className="h-8 w-8 text-[#FF385C]" />
                            <Zap className="h-4 w-4 text-[#FC642D] absolute -top-1 -right-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                active
                                    ? 'bg-[#FF385C] text-white shadow-md'
                                    : 'text-[#717171] dark:text-[#B0B0B0] hover:bg-[#F7F7F7] dark:hover:bg-[#484848] hover:text-[#222222] dark:hover:text-white'
                            }`}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 transition-colors ${
                                active ? 'text-white' : 'text-[#717171] dark:text-[#B0B0B0] group-hover:text-[#FF385C]'
                            }`} />
                            {!isCollapsed && <span className="font-medium">{item.name}</span>}
                            {!isCollapsed && active && (
                                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Status Indicator */}
            {!isCollapsed && (
                <div className="px-6 py-4 border-t border-slate-800/50">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-slate-300">System Online</span>
                        </div>
                        <div className="text-xs text-slate-400">v2.1.0</div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-800/50 p-4">
                <button
                    onClick={logout}
                    className={`flex items-center w-full ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group`}
                    title={isCollapsed ? "Sign Out" : undefined}
                >
                    <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 group-hover:text-red-400`} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;