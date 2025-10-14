import React from 'react';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import Card from '../ui/Card';
import { useOrders } from '../../hooks/useOrders';
import { useUsers } from '../../hooks/useUsers';

interface SalesByUserProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const SalesByUser: React.FC<SalesByUserProps> = ({ dateRange }) => {
  const { orders } = useOrders();
  const { users } = useUsers();

  // Filtrer les commandes par période
  const filteredOrders = orders.filter(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0];
    return orderDate >= dateRange.startDate && 
           orderDate <= dateRange.endDate && 
           order.status === 'paid';
  });

  // Calculer les ventes par utilisateur
  const salesByUser = filteredOrders.reduce((acc, order) => {
    const userId = order.waiterId || 'caisse';
    const user = users.find(u => u.id === userId);
    const userName = user?.name || (userId === 'caisse' ? 'Caisse directe' : 'Utilisateur inconnu');
    const userRole = user?.role || 'cashier';

    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName,
        userRole,
        orderCount: 0,
        totalRevenue: 0,
        totalItems: 0,
        orders: [],
        averageOrderValue: 0,
        bestDay: { date: '', revenue: 0 },
        categories: {},
      };
    }

    acc[userId].orderCount += 1;
    acc[userId].totalRevenue += order.total;
    acc[userId].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    acc[userId].orders.push(order);

    // Meilleur jour
    const orderDate = order.createdAt.toISOString().split('T')[0];
    const dayRevenue = acc[userId].orders
      .filter(o => o.createdAt.toISOString().split('T')[0] === orderDate)
      .reduce((sum, o) => sum + o.total, 0);
    
    if (dayRevenue > acc[userId].bestDay.revenue) {
      acc[userId].bestDay = { date: orderDate, revenue: dayRevenue };
    }

    // Catégories vendues
    order.items.forEach(item => {
      const category = item.category || 'Autres';
      if (!acc[userId].categories[category]) {
        acc[userId].categories[category] = { quantity: 0, revenue: 0 };
      }
      acc[userId].categories[category].quantity += item.quantity;
      acc[userId].categories[category].revenue += item.price * item.quantity;
    });

    return acc;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    userRole: string;
    orderCount: number;
    totalRevenue: number;
    totalItems: number;
    orders: any[];
    averageOrderValue: number;
    bestDay: { date: string; revenue: number };
    categories: Record<string, { quantity: number; revenue: number }>;
  }>);

  // Calculer les moyennes et trier
  const userStats = Object.values(salesByUser).map(user => ({
    ...user,
    averageOrderValue: user.totalRevenue / user.orderCount,
    averageItemsPerOrder: user.totalItems / user.orderCount,
    topCategory: Object.entries(user.categories).sort(([,a], [,b]) => b.revenue - a.revenue)[0],
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalRevenue = userStats.reduce((sum, user) => sum + user.totalRevenue, 0);
  const totalOrders = userStats.reduce((sum, user) => sum + user.orderCount, 0);
  const totalItems = userStats.reduce((sum, user) => sum + user.totalItems, 0);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'waiter': return 'bg-green-100 text-green-800';
      case 'kitchen': return 'bg-orange-100 text-orange-800';
      case 'cashier': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'waiter': return 'Serveur';
      case 'kitchen': return 'Cuisine';
      case 'cashier': return 'Caissier';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ventes par utilisateur</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires total (CFA)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-sm text-gray-600">Commandes totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Articles vendus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{userStats.length}</div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
        </div>
      </Card>

      {/* Classement des utilisateurs */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Classement par chiffre d'affaires
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-900">Rang</th>
                <th className="text-left py-3 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-3 font-medium text-gray-900">Rôle</th>
                <th className="text-right py-3 font-medium text-gray-900">Commandes</th>
                <th className="text-right py-3 font-medium text-gray-900">Articles</th>
                <th className="text-right py-3 font-medium text-gray-900">Chiffre d'affaires</th>
                <th className="text-right py-3 font-medium text-gray-900">Panier moyen</th>
                <th className="text-right py-3 font-medium text-gray-900">Part du CA</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((user, index) => {
                const revenuePercentage = totalRevenue > 0 ? (user.totalRevenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                        {index < 3 && <TrendingUp className="h-4 w-4 text-green-500" />}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-blue-500'
                        }`}>
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.userName}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.userRole)}`}>
                        {getRoleLabel(user.userRole)}
                      </span>
                    </td>
                    <td className="text-right py-3 font-semibold">{user.orderCount}</td>
                    <td className="text-right py-3">{user.totalItems}</td>
                    <td className="text-right py-3 font-semibold text-green-600">
                      {user.totalRevenue.toLocaleString('fr-FR')} CFA
                    </td>
                    <td className="text-right py-3">{user.averageOrderValue.toFixed(0)} CFA</td>
                    <td className="text-right py-3 font-semibold">{revenuePercentage.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Analyse détaillée du top 3 */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Analyse détaillée - Top 3 performers</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userStats.slice(0, 3).map((user, index) => {
            const revenuePercentage = totalRevenue > 0 ? (user.totalRevenue / totalRevenue) * 100 : 0;
            return (
              <div key={user.userId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{user.userName}</h5>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.userRole)}`}>
                      {getRoleLabel(user.userRole)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Chiffre d'affaires :</span>
                    <span className="font-semibold text-green-600">
                      {user.totalRevenue.toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part du CA :</span>
                    <span className="font-semibold">{revenuePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commandes :</span>
                    <span className="font-semibold">{user.orderCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Articles vendus :</span>
                    <span className="font-semibold">{user.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Panier moyen :</span>
                    <span className="font-semibold">{user.averageOrderValue.toFixed(0)} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Articles/commande :</span>
                    <span className="font-semibold">{user.averageItemsPerOrder.toFixed(1)}</span>
                  </div>
                  {user.topCategory && (
                    <div className="flex justify-between">
                      <span>Catégorie forte :</span>
                      <span className="font-semibold">{user.topCategory[0]}</span>
                    </div>
                  )}
                  {user.bestDay.revenue > 0 && (
                    <div className="flex justify-between">
                      <span>Meilleur jour :</span>
                      <span className="font-semibold">{user.bestDay.revenue.toLocaleString('fr-FR')} CFA</span>
                    </div>
                  )}
                </div>
                
                {/* Barre de progression */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-amber-600'
                      }`}
                      style={{ width: `${revenuePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance par rôle */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Performance par rôle</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(
            userStats.reduce((acc, user) => {
              if (!acc[user.userRole]) {
                acc[user.userRole] = {
                  role: user.userRole,
                  userCount: 0,
                  totalRevenue: 0,
                  totalOrders: 0,
                  totalItems: 0,
                };
              }
              acc[user.userRole].userCount += 1;
              acc[user.userRole].totalRevenue += user.totalRevenue;
              acc[user.userRole].totalOrders += user.orderCount;
              acc[user.userRole].totalItems += user.totalItems;
              return acc;
            }, {} as Record<string, any>)
          ).map(([role, stats]) => (
            <div key={role} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)}`}>
                  {getRoleLabel(role)}
                </span>
                <span className="text-sm text-gray-600">({stats.userCount} utilisateurs)</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Chiffre d'affaires :</span>
                  <span className="font-semibold text-green-600">
                    {stats.totalRevenue.toLocaleString('fr-FR')} CFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Commandes :</span>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Articles :</span>
                  <span className="font-semibold">{stats.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>CA moyen/utilisateur :</span>
                  <span className="font-semibold">
                    {(stats.totalRevenue / stats.userCount).toFixed(0)} CFA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommandations */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Recommandations</h4>
        <div className="space-y-3">
          {userStats[0] && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>🏆 Top performer :</strong> {userStats[0].userName} génère {((userStats[0].totalRevenue / totalRevenue) * 100).toFixed(1)}% 
                du chiffre d'affaires avec un panier moyen de {userStats[0].averageOrderValue.toFixed(0)} CFA. 
                Excellent travail !
              </p>
            </div>
          )}
          
          {userStats.length > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📊 Analyse :</strong> L'écart entre le meilleur et le moins performant est de {
                  userStats.length > 1 ? 
                  (userStats[0].totalRevenue - userStats[userStats.length - 1].totalRevenue).toLocaleString('fr-FR') : 
                  '0'
                } CFA. 
                Considérez des formations ou un système de motivation pour harmoniser les performances.
              </p>
            </div>
          )}
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 Conseil :</strong> Mettez en place un système de primes basé sur les ventes pour motiver vos équipes. 
              Analysez les techniques des meilleurs performers pour les partager avec l'équipe.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesByUser;