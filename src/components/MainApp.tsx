import React, { useState } from 'react';
import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import Dashboard from './Dashboard/Dashboard';
import TableGrid from './Tables/TableGrid';
import ProductsManagement from './Products/ProductsManagement';
import OrdersManagement from './Orders/OrdersManagement';
import POSSystem from './POS/POSSystem';
import Settings from './Settings/Settings';
import WaiterApp from './Waiter/WaiterApp';
import ReportsManagement from './Reports/ReportsManagement';
import { useTables } from '../hooks/useTables';
import { useAuth } from '../hooks/useAuth';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { tables } = useTables();
  const { user } = useAuth();

  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      pos: 'Point de vente',
      waiter: 'Interface serveur',
      dashboard: 'Tableau de bord',
      orders: 'Gestion des commandes',
      products: 'Gestion des produits',
      tables: 'Gestion des tables',
      customers: 'Gestion des clients',
      delivery: 'Gestion des livraisons',
      kiosk: 'Commandes kiosque',
      reports: 'Rapports et analyses',
      settings: 'Paramètres système',
    };
    return titles[tab] || 'RestoBar';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return <POSSystem />;
      case 'waiter':
        return <WaiterApp />;
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManagement />;
      case 'tables':
        return (
          <TableGrid 
            tables={tables} 
            onTableClick={(table) => console.log('Table cliquée:', table)}
          />
        );
      case 'orders':
        return <OrdersManagement />;
      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des clients</h2>
            <p className="text-gray-600">L'interface de gestion des clients sera implémentée ici.</p>
          </div>
        );
      case 'delivery':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des livraisons</h2>
            <p className="text-gray-600">L'interface de gestion des livraisons sera implémentée ici.</p>
          </div>
        );
      case 'kiosk':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Commandes kiosque</h2>
            <p className="text-gray-600">L'interface des commandes kiosque sera implémentée ici.</p>
          </div>
        );
      case 'reports':
        return <ReportsManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <POSSystem />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userRole={user?.role}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              userRole={user?.role}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={getTabTitle(activeTab)} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;