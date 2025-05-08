import React, {useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {Search, Bell, Menu} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({toggleSidebar}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const {currentUser} = useAuth();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/inventory/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;

        if (path === '/dashboard') return 'Dashboard';
        if (path === '/inventory/items') return 'Inventory Items';
        if (path === '/inventory/add') return 'Add New Item';
        if (path === '/inventory/receive') return 'Receive Items';
        if (path === '/inventory/transfer') return 'Transfer Items';
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
        <header className="bg-white border-b border-gray-200 z-10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                        >
                            <Menu size={24}/>
                        </button>
                        <h1 className="ml-2 md:ml-0 text-lg md:text-xl font-semibold text-gray-900">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                        <form onSubmit={handleSearch} className="max-w-lg w-full">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search inventory (SKU, name, description...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center">
                        <button
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <Bell className="h-6 w-6"/>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;