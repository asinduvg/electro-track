import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Home, Package, Map, Clipboard, BarChart3, Settings, Users, 
  LogOut, ChevronDown, Search, CircleSlash, ArrowRightLeft, PackagePlus
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  label, 
  isActive, 
  hasSubmenu, 
  isOpen, 
  onClick 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick && hasSubmenu) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
        isActive 
          ? 'bg-blue-700 text-white' 
          : 'text-gray-300 hover:bg-blue-800 hover:text-white'
      }`}
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {hasSubmenu && (
        <ChevronDown 
          className={`ml-auto transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      )}
    </button>
  );
};

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [inventoryOpen, setInventoryOpen] = React.useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isInventorySection = location.pathname.startsWith('/inventory');

  return (
    <div className="bg-blue-900 text-white w-64 flex flex-col h-full">
      <div className="px-6 py-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold flex items-center">
          <Package className="mr-2" />
          ElectroTrack
        </h1>
        <p className="text-blue-300 text-sm mt-1">Inventory Management</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          <SidebarLink 
            to="/dashboard" 
            icon={<Home />} 
            label="Dashboard" 
            isActive={isActive('/dashboard')} 
          />
          
          <SidebarLink 
            to="#" 
            icon={<Package />} 
            label="Inventory" 
            isActive={isInventorySection} 
            hasSubmenu={true}
            isOpen={inventoryOpen}
            onClick={() => setInventoryOpen(!inventoryOpen)}
          />
          
          {inventoryOpen && (
            <div className="pl-10 space-y-1 bg-blue-950">
              <SidebarLink 
                to="/inventory/items" 
                icon={<Search size={16} />} 
                label="Browse Items" 
                isActive={isActive('/inventory/items')} 
              />
              {(currentUser.role === UserRole.ADMIN || 
                currentUser.role === UserRole.INVENTORY_MANAGER) && (
                <SidebarLink 
                  to="/inventory/add" 
                  icon={<PackagePlus size={16} />} 
                  label="Add Item" 
                  isActive={isActive('/inventory/add')} 
                />
              )}
              {(currentUser.role === UserRole.ADMIN || 
                currentUser.role === UserRole.WAREHOUSE_STAFF || 
                currentUser.role === UserRole.INVENTORY_MANAGER) && (
                <>
                  <SidebarLink 
                    to="/inventory/receive" 
                    icon={<PackagePlus size={16} />} 
                    label="Receive Items" 
                    isActive={isActive('/inventory/receive')} 
                  />
                  <SidebarLink 
                    to="/inventory/transfer" 
                    icon={<ArrowRightLeft size={16} />} 
                    label="Transfer Items" 
                    isActive={isActive('/inventory/transfer')} 
                  />
                  <SidebarLink 
                    to="/inventory/dispose" 
                    icon={<CircleSlash size={16} />} 
                    label="Dispose Items" 
                    isActive={isActive('/inventory/dispose')} 
                  />
                </>
              )}
            </div>
          )}
          
          <SidebarLink 
            to="/locations" 
            icon={<Map />} 
            label="Locations" 
            isActive={isActive('/locations')} 
          />
          
          <SidebarLink 
            to="/reports" 
            icon={<BarChart3 />} 
            label="Reports" 
            isActive={isActive('/reports')} 
          />
          
          {(currentUser.role === UserRole.ADMIN || 
            currentUser.role === UserRole.INVENTORY_MANAGER) && (
            <SidebarLink 
              to="/settings" 
              icon={<Settings />} 
              label="Settings" 
              isActive={isActive('/settings')} 
            />
          )}
          
          {currentUser.role === UserRole.ADMIN && (
            <SidebarLink 
              to="/users" 
              icon={<Users />} 
              label="User Management" 
              isActive={isActive('/users')} 
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center mr-3">
            <span className="font-medium text-lg">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-xs text-blue-300">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-blue-800 hover:text-white rounded transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;