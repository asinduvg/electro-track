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
    X,
    Building2,
    AlertTriangle,
    Upload,
    TrendingUp,
    FolderTree
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

    const currentUserRole = 'admin'; // This would come from auth context in production
    
    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'inventory_manager', 'warehouse_staff', 'department_user'] },
        { name: 'Components', href: '/inventory/items', icon: Package, roles: ['admin', 'inventory_manager', 'warehouse_staff', 'department_user'] },
        { name: 'Categories', href: '/categories', icon: FolderTree, roles: ['admin', 'inventory_manager'] },
        { name: 'Storage', href: '/locations', icon: MapPin, roles: ['admin', 'inventory_manager', 'warehouse_staff'] },
        { name: 'Suppliers', href: '/suppliers', icon: Building2, roles: ['admin', 'inventory_manager'] },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle, roles: ['admin', 'inventory_manager', 'warehouse_staff'] },
        { name: 'Bulk Ops', href: '/bulk-operations', icon: Upload, roles: ['admin', 'inventory_manager'] },
        { name: 'Advanced Analytics', href: '/advanced-analytics', icon: TrendingUp, roles: ['admin', 'inventory_manager'] },
        { name: 'Analytics', href: '/reports', icon: BarChart3, roles: ['admin', 'inventory_manager', 'warehouse_staff'] },
        { name: 'Team', href: '/users', icon: Users, roles: ['admin'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'inventory_manager'] },
    ].filter(item => item.roles.includes(currentUserRole));

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
                    <div className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                            <span className="text-sm text-black font-semibold">System Online</span>
                        </div>
                        <div className="text-sm text-emerald-300 font-bold">v2.1.0</div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-800/50 p-6">
                <button
                    onClick={logout}
                    className={`flex items-center w-full ${isCollapsed ? 'justify-center px-3' : 'px-6'} py-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 group border border-slate-200 hover:border-slate-300`}
                    title={isCollapsed ? "Sign Out" : undefined}
                >
                    <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-600`} />
                    {!isCollapsed && <span className="text-slate-600 font-medium">Sign Out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;