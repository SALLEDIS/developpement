import React, { useState } from 'react';
import { Settings as SettingsIcon, Printer, Store, Users, CreditCard, Bell, Shield, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import PrinterSettings from './PrinterSettings';
import UserManagement from './UserManagement';
import RestaurantSettings from './RestaurantSettings';
import CashManagement from './CashManagement';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('printers');

  const settingsTabs = [
    { id: 'printers', label: 'Imprimantes', icon: Printer },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'restaurant', label: 'Restaurant', icon: Store },
    { id: 'cash', label: 'Caisse', icon: DollarSign },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'printers':
        return <PrinterSettings />;
      case 'users':
        return <UserManagement />;
      case 'restaurant':
        return <RestaurantSettings />;
      case 'cash':
        return <CashManagement />;
      case 'payments':
        return (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration des paiements</h3>
            <p className="text-gray-600">Configuration des méthodes de paiement à venir...</p>
          </Card>
        );
      case 'notifications':
        return (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de notifications</h3>
            <p className="text-gray-600">Configuration des notifications à venir...</p>
          </Card>
        );
      case 'security':
        return (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h3>
            <p className="text-gray-600">Configuration de la sécurité à venir...</p>
          </Card>
        );
      default:
        return <PrinterSettings />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Menu latéral des paramètres - Responsive */}
      <div className="w-full lg:w-64 space-y-2">
        <Card padding="sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h2>
          <nav className="space-y-1">
            {settingsTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;