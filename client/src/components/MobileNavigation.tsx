import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { 
  Menu, X, Home, Package, MapPin, Users, FileText, 
  Settings, Truck, BarChart3, Bell, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
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
    return location === path || (path !== '/' && location.startsWith(path));
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 h-10 w-10 shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#FF385C]">ElectroStock</h1>
                <p className="text-sm text-gray-600">Inventory Management</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF385C] rounded-full flex items-center justify-center text-white font-semibold">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
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
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-[#FF385C] text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-colors
                  ${isActive 
                    ? 'text-[#FF385C] bg-[#FFF3F4]' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5 mb-1" />
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