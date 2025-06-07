import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    MapPin, 
    Users, 
    BarChart3, 
    Settings,
    LogOut,
    Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory/items', icon: Package },
        { name: 'Locations', href: '/locations', icon: MapPin },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white w-64">
            {/* Header */}
            <div className="flex items-center px-6 py-4 border-b border-gray-700">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-semibold">InventoryPro</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isActive(item.href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-700 p-4">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;