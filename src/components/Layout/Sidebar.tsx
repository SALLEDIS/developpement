import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Table, 
  BarChart3, 
  Settings, 
  LogOut,
  Receipt,
  Truck,
  Monitor,
  Utensils
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'pos', label: 'POINT DE VENTE', icon: Receipt, roles: ['admin', 'manager', 'cashier'] },
    { id: 'waiter', label: 'INTERFACE SERVEUR', icon: Utensils, roles: ['admin', 'manager', 'waiter'] },
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, roles: ['admin', 'manager'] },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart, roles: ['admin', 'manager', 'waiter', 'kitchen'] },
    { id: 'products', label: 'Produits', icon: Package, roles: ['admin', 'manager'] },
    { id: 'tables', label: 'Tables', icon: Table, roles: ['admin', 'manager', 'waiter'] },
    { id: 'customers', label: 'Clients', icon: Users, roles: ['admin', 'manager'] },
    { id: 'delivery', label: 'Livraison', icon: Truck, roles: ['admin', 'manager'] },
    { id: 'kiosk', label: 'Kiosque', icon: Monitor, roles: ['admin', 'manager'] },
    { id: 'reports', label: 'Rapports', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h1 className="text-xl lg:text-2xl font-bold">🍽️ RestoBar</h1>
        <p className="text-gray-400 text-sm mt-1">Système de gestion</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1 lg:space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 lg:h-5 w-4 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-sm lg:text-base truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm lg:text-base">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 lg:px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
          <span className="text-sm lg:text-base">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;