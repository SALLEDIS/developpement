import React from 'react';
import { DollarSign, ShoppingCart, Clock, Users, TrendingUp, Calendar, Package, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import RecentOrders from './RecentOrders';
import PopularProducts from './PopularProducts';
import DailySalesChart from './DailySalesChart';
import CategoryPerformance from './CategoryPerformance';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';
import { useExpenses } from '../../hooks/useExpenses';

const Dashboard: React.FC = () => {
  const { products } = useProducts();
  const { 
    getTodaysSales, 
    getTodaysOrders, 
    getActiveOrders, 
    getRecentOrders,
    orders
  } = useOrders();
  const { getAvailableTables } = useTables();
  const { getTodaysExpenses } = useExpenses();

  // Calculer les statistiques en temps réel
  const todaysSales = getTodaysSales();
  const todaysOrders = getTodaysOrders();
  const activeOrders = getActiveOrders();
  const availableTables = getAvailableTables();
  const recentOrders = getRecentOrders(5);
  const popularProducts = products.slice(0, 5);
  const todaysExpenses = getTodaysExpenses();
  const todaysProfit = todaysSales - todaysExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculer les ventes des 7 derniers jours pour la tendance
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dayOrders = orders.filter(order => 
      order.createdAt >= date && 
      order.createdAt < nextDay && 
      order.status === 'paid'
    );
    
    return {
      date: date.toISOString().split('T')[0],
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length,
    };
  }).reverse();

  // Calculer la tendance (comparaison avec hier)
  const yesterdaySales = last7Days[last7Days.length - 2]?.sales || 0;
  const salesChange = yesterdaySales > 0 ? 
    `${todaysSales > yesterdaySales ? '+' : ''}${(((todaysSales - yesterdaySales) / yesterdaySales) * 100).toFixed(1)}% vs hier` :
    'Première journée';

  const yesterdayOrders = last7Days[last7Days.length - 2]?.orders || 0;
  const ordersChange = yesterdayOrders > 0 ?
    `${todaysOrders.length > yesterdayOrders ? '+' : ''}${(((todaysOrders.length - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1)}% vs hier` :
    'Première journée';

  // Calculer les ventes par catégorie pour aujourd'hui
  const todaysSalesByCategory = todaysOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const category = item.category || 'Autres';
      if (!acc[category]) {
        acc[category] = { revenue: 0, quantity: 0 };
      }
      acc[category].revenue += item.price * item.quantity;
      acc[category].quantity += item.quantity;
    });
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number }>);

  const categoryStats = Object.entries(todaysSalesByCategory)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  // Alertes et notifications
  const lowStockProducts = products.filter(p => p.isActive && (p.stock || 0) < 5);
  const unsoldProducts = products.filter(p => {
    const productSold = todaysOrders.some(order => 
      order.items.some(item => item.productId === p.id)
    );
    return p.isActive && !productSold;
  });

  return (
    <div className="space-y-6">
      {/* Grille des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventes du jour"
          value={todaysSales}
          change={salesChange}
          changeType={todaysSales > yesterdaySales ? "positive" : todaysSales < yesterdaySales ? "negative" : "neutral"}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Commandes du jour"
          value={todaysOrders.length}
          change={ordersChange}
          changeType={todaysOrders.length > yesterdayOrders ? "positive" : todaysOrders.length < yesterdayOrders ? "negative" : "neutral"}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Commandes actives"
          value={activeOrders.length}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Tables disponibles"
          value={`${availableTables.length}/20`}
          icon={Users}
          color="red"
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Bénéfice du jour"
          value={todaysProfit}
          icon={TrendingUp}
          color={todaysProfit >= 0 ? "green" : "red"}
        />
        <StatCard
          title="Panier moyen"
          value={todaysOrders.length > 0 ? Math.round(todaysSales / todaysOrders.length) : 0}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Articles vendus"
          value={todaysOrders.reduce((sum, order) => sum + order.items.length, 0)}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Charges du jour"
          value={todaysExpenses.reduce((sum, e) => sum + e.amount, 0)}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Alertes */}
      {(lowStockProducts.length > 0 || unsoldProducts.length > 5) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Stock faible ({lowStockProducts.length})</h3>
              </div>
              <div className="space-y-1">
                {lowStockProducts.slice(0, 3).map(product => (
                  <p key={product.id} className="text-sm text-red-700">
                    {product.name}: {product.stock || 0} restant(s)
                  </p>
                ))}
                {lowStockProducts.length > 3 && (
                  <p className="text-sm text-red-600">Et {lowStockProducts.length - 3} autres...</p>
                )}
              </div>
            </div>
          )}

          {unsoldProducts.length > 5 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Produits non vendus ({unsoldProducts.length})</h3>
              </div>
              <p className="text-sm text-amber-700">
                {unsoldProducts.length} produits n'ont pas été vendus aujourd'hui. 
                Considérez des promotions ou une révision de l'offre.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySalesChart salesData={last7Days} />
        <CategoryPerformance categoryStats={categoryStats} />
      </div>

      {/* Listes détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />
        <PopularProducts products={popularProducts} />
      </div>

      {/* Messages d'accueil et conseils */}
      {products.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Bienvenue dans votre système RestoBar !
          </h3>
          <p className="text-blue-700 mb-4">
            Votre système est prêt à l'emploi. Commencez par ajouter vos premiers produits pour démarrer les ventes.
          </p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => window.location.hash = '#products'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter des produits
            </button>
            <button 
              onClick={() => window.location.hash = '#settings'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Configurer les imprimantes
            </button>
          </div>
        </div>
      )}

      {/* Résumé de performance */}
      {todaysOrders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Résumé de la journée
            </h3>
            <button 
              onClick={() => window.location.hash = '#reports'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Voir les rapports détaillés
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todaysOrders.length}</div>
              <div className="text-sm text-green-700">Commandes totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todaysOrders.filter(o => o.status === 'paid').length}
              </div>
              <div className="text-sm text-blue-700">Commandes payées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {todaysOrders.reduce((sum, o) => sum + o.items.length, 0)}
              </div>
              <div className="text-sm text-purple-700">Articles vendus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {categoryStats.length}
              </div>
              <div className="text-sm text-amber-700">Catégories vendues</div>
            </div>
          </div>
          
          {/* Top 3 des catégories */}
          {categoryStats.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Top 3 des catégories aujourd'hui :</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {categoryStats.slice(0, 3).map((category, index) => (
                  <div key={category.name} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-amber-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{category.quantity} articles • {category.revenue.toLocaleString('fr-FR')} CFA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;