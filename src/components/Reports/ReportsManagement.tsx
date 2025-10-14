import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Calendar, Download, Filter, DollarSign, ShoppingCart, Clock, Printer } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SalesByCategory from './SalesByCategory';
import SalesByProduct from './SalesByProduct';
import SalesByUser from './SalesByUser';
import DailySalesReport from './DailySalesReport';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useUsers } from '../../hooks/useUsers';

const ReportsManagement: React.FC = () => {
  const [activeReport, setActiveReport] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { orders, getTodaysOrders, getTodaysSales } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();

  const reportTypes = [
    { id: 'daily', label: 'Ventes journalières', icon: Calendar },
    { id: 'category', label: 'Par catégorie', icon: BarChart3 },
    { id: 'product', label: 'Par article', icon: Package },
    { id: 'user', label: 'Par utilisateur', icon: Users },
  ];

  // Calculer les statistiques générales
  const todaysOrders = getTodaysOrders();
  const todaysSales = getTodaysSales();
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const activeUsers = users.filter(u => u.isActive).length;

  const renderReportContent = () => {
    switch (activeReport) {
      case 'daily':
        return <DailySalesReport dateRange={dateRange} />;
      case 'category':
        return <SalesByCategory dateRange={dateRange} />;
      case 'product':
        return <SalesByProduct dateRange={dateRange} />;
      case 'user':
        return <SalesByUser dateRange={dateRange} />;
      default:
        return <DailySalesReport dateRange={dateRange} />;
    }
  };

  const exportReport = () => {
    const reportData = {
      type: activeReport,
      dateRange,
      generatedAt: new Date().toISOString(),
      data: {
        todaysOrders: todaysOrders.length,
        todaysSales,
        totalOrders,
        totalProducts,
        activeUsers,
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${activeReport}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Rapport exporté avec succès !');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports et analyses</h2>
          <p className="text-gray-600">Analysez vos ventes par catégorie, article et utilisateur</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={printReport} variant="secondary" icon={Printer}>
            Imprimer
          </Button>
          <Button onClick={exportReport} icon={Download}>
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">{todaysSales.toLocaleString('fr-FR')}</div>
          <div className="text-sm text-gray-600">Ventes aujourd'hui (CFA)</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{todaysOrders.length}</div>
          <div className="text-sm text-gray-600">Commandes aujourd'hui</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total commandes</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{activeUsers}</div>
          <div className="text-sm text-gray-600">Utilisateurs actifs</div>
        </Card>
      </div>

      {/* Filtres et sélection de rapport */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Types de rapports */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveReport(type.id)}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      activeReport === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtres de date */}
          <div className="lg:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                size="sm"
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                size="sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Contenu du rapport */}
      <div className="print:shadow-none">
        {renderReportContent()}
      </div>

      {/* Résumé rapide */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {todaysOrders.length > 0 ? (todaysSales / todaysOrders.length).toFixed(0) : '0'}
            </div>
            <div className="text-sm text-gray-600">Panier moyen (CFA)</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {products.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Produits actifs</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {todaysOrders.reduce((sum, order) => sum + order.items.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Articles vendus aujourd'hui</div>
          </div>
        </div>
      </Card>

      {/* Instructions d'utilisation */}
      <Card className="print:hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide d'utilisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Types de rapports disponibles</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Ventes journalières :</strong> Évolution des ventes par jour</li>
              <li>• <strong>Par catégorie :</strong> Performance par catégorie de produits</li>
              <li>• <strong>Par article :</strong> Produits les plus vendus</li>
              <li>• <strong>Par utilisateur :</strong> Performance des équipes</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Actions disponibles</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Imprimer :</strong> Impression directe du rapport</li>
              <li>• <strong>Exporter :</strong> Téléchargement en format JSON</li>
              <li>• <strong>Filtrer :</strong> Sélection de période personnalisée</li>
              <li>• <strong>Actualisation :</strong> Données en temps réel</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsManagement;