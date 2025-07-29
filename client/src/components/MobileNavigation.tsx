import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import {
  Menu,
  X,
  Home,
  Package,
  MapPin,
  Users,
  FileText,
  Settings,
  Truck,
  BarChart3,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/transactions', label: 'Transactions', icon: FileText },
    { path: '/suppliers', label: 'Suppliers', icon: Truck },
    { path: '/categories', label: 'Categories', icon: BarChart3 },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActiveRoute = (path: string) => {
    const currentPath = window.location.pathname;
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 p-2 shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#FF385C]">ElectroTrack</h1>
                <p className="text-sm text-gray-600">Inventory Management</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF385C] font-semibold text-white">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-sm capitalize text-gray-500">{currentUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#FF385C] text-white' : 'text-gray-700 hover:bg-gray-100'
                    } `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white lg:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs transition-colors ${
                  isActive ? 'bg-[#FFF3F4] text-[#FF385C]' : 'text-gray-600 hover:text-gray-900'
                } `}
              >
                <Icon className="mb-1 h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
