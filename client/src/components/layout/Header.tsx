import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/inventory/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/dashboard') return 'Dashboard';
    if (path === '/inventory') return 'Inventory Management';

    if (path === '/inventory/receive') return 'Receive Items';

    if (path === '/inventory/dispose') return 'Dispose Items';
    if (path.startsWith('/inventory/edit/')) return 'Edit Item';
    if (path.startsWith('/inventory/view/')) return 'Item Details';
    if (path === '/locations') return 'Storage Locations';
    if (path === '/reports') return 'Reports & Analytics';
    if (path === '/settings') return 'System Settings';
    if (path === '/users') return 'User Management';

    return 'Electronics Inventory';
  };

  if (!currentUser) return null;

  return (
    <header className="z-10 border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-2 text-lg font-semibold text-gray-900 md:ml-0 md:text-xl">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search inventory (SKU, name, description...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="flex items-center">
            <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
