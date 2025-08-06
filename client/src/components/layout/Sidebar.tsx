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
  FolderTree,
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
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'inventory_manager', 'warehouse_staff', 'department_user'],
    },
    {
      name: 'Components',
      href: '/inventory',
      icon: Package,
      roles: ['admin', 'inventory_manager', 'warehouse_staff', 'department_user'],
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FolderTree,
      roles: ['admin', 'inventory_manager'],
    },
    {
      name: 'Storage',
      href: '/locations',
      icon: MapPin,
      roles: ['admin', 'inventory_manager', 'warehouse_staff'],
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: Building2,
      roles: ['admin', 'inventory_manager'],
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: AlertTriangle,
      roles: ['admin', 'inventory_manager', 'warehouse_staff'],
    },
    {
      name: 'Bulk Ops',
      href: '/bulk-operations',
      icon: Upload,
      roles: ['admin', 'inventory_manager'],
    },
    {
      name: 'Advanced Analytics',
      href: '/advanced-analytics',
      icon: TrendingUp,
      roles: ['admin', 'inventory_manager'],
    },
    {
      name: 'Analytics',
      href: '/reports',
      icon: BarChart3,
      roles: ['admin', 'inventory_manager', 'warehouse_staff'],
    },
    { name: 'Team', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'inventory_manager'] },
  ].filter((item) => item.roles.includes(currentUserRole));

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div
      className={`flex h-full flex-col border-r border-[#EBEBEB] bg-white text-[#222222] shadow-lg transition-all duration-300 dark:border-[#484848] dark:bg-[#222222] dark:text-white ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] px-6 py-6 dark:border-[#484848]">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Cpu className="h-8 w-8 text-[#FF385C]" />
              <Zap className="absolute -right-1 -top-1 h-4 w-4 text-[#FC642D]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#FF385C]">{companyName}</h1>
              <p className="text-xs font-medium text-[#717171]">Component Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex w-full items-center justify-center">
            <div className="relative">
              <Cpu className="h-8 w-8 text-[#FF385C]" />
              <Zap className="absolute -right-1 -top-1 h-4 w-4 text-[#FC642D]" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#FF385C] text-white shadow-md'
                  : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222] dark:text-[#B0B0B0] dark:hover:bg-[#484848] dark:hover:text-white'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#717171] group-hover:text-[#FF385C] dark:text-[#B0B0B0]'
                }`}
              />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
              {!isCollapsed && active && <div className="ml-auto h-2 w-2 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Status Indicator */}
      {!isCollapsed && (
        <div className="border-t border-slate-800/50 px-6 py-4">
          <div className="flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
              <span className="text-sm font-semibold text-black">System Online</span>
            </div>
            <div className="text-sm font-bold text-emerald-300">v2.1.0</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-800/50 p-4">
        <button
          onClick={logout}
          className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} group rounded-lg border border-slate-200 bg-slate-100 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-200`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-600`} />
          {!isCollapsed && <span className="font-medium text-slate-600">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
