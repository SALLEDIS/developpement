import React from 'react';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import Card from '../ui/Card';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';

interface SalesByCategoryProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const SalesByCategory: React.FC<SalesByCategoryProps> = ({ dateRange }) => {
  const { orders } = useOrders();
  const { categories } = useProducts();

  // Filtrer les commandes par période
  const filteredOrders = orders.filter(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0];
    return orderDate >= dateRange.startDate && 
           orderDate <= dateRange.endDate && 
           order.status === 'paid';
  });

  // Calculer les ventes par catégorie
  const salesByCategory = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const category = item.category || 'Autres';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          quantity: 0,
          revenue: 0,
          orders: new Set(),
        };
      }
      acc[category].quantity += item.quantity;
      acc[category].revenue += item.price * item.quantity;
      acc[category].orders.add(order.id);
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number; orders: Set<string> }>);

  const categoryStats = Object.values(salesByCategory).map(cat => ({
    ...cat,
    orderCount: cat.orders.size,
    averageOrderValue: cat.revenue / cat.orders.size || 0,
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = categoryStats.reduce((sum, cat) => sum + cat.revenue, 0);
  const totalQuantity = categoryStats.reduce((sum, cat) => sum + cat.quantity, 0);

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (category?.icon) {
      switch (category.icon) {
        case 'utensils': return '🍴';
        case 'chef-hat': return '👨‍🍳';
        case 'cake': return '🍰';
        case 'glass-water': return '🥤';
        case 'wine': return '🍷';
        case 'coffee': return '☕';
        case 'pizza': return '🍕';
        case 'sandwich': return '🥪';
        case 'salad': return '🥗';
        case 'ice-cream': return '🍦';
        default: return '📦';
      }
    }
    return '📦';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ventes par catégorie</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires total (CFA)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalQuantity}</div>
            <div className="text-sm text-gray-600">Articles vendus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{categoryStats.length}</div>
            <div className="text-sm text-gray-600">Catégories actives</div>
          </div>
        </div>
      </Card>

      {/* Graphique et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">Répartition du chiffre d'affaires</h4>
          <div className="space-y-3">
            {categoryStats.map((category, index) => {
              const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category.name)}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-green-600' :
                        index === 2 ? 'bg-purple-600' :
                        index === 3 ? 'bg-amber-600' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{category.quantity} articles</span>
                    <span>{category.revenue.toLocaleString('fr-FR')} CFA</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tableau détaillé */}
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">Détails par catégorie</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Catégorie</th>
                  <th className="text-right py-2 font-medium text-gray-900">Qté</th>
                  <th className="text-right py-2 font-medium text-gray-900">CA</th>
                  <th className="text-right py-2 font-medium text-gray-900">Cmd</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((category, index) => (
                  <tr key={category.name} className="border-b border-gray-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(category.name)}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2">{category.quantity}</td>
                    <td className="text-right py-2 font-semibold">
                      {category.revenue.toLocaleString('fr-FR')}
                    </td>
                    <td className="text-right py-2">{category.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Analyse de performance */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Analyse de performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryStats.slice(0, 3).map((category, index) => (
            <div key={category.name} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{getCategoryIcon(category.name)}</div>
              <h5 className="font-semibold text-gray-900 mb-2">{category.name}</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Chiffre d'affaires :</span>
                  <span className="font-semibold">{category.revenue.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Articles vendus :</span>
                  <span className="font-semibold">{category.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commandes :</span>
                  <span className="font-semibold">{category.orderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Panier moyen :</span>
                  <span className="font-semibold">{category.averageOrderValue.toFixed(0)} CFA</span>
                </div>
              </div>
              {index === 0 && (
                <div className="mt-2 flex items-center justify-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Top performer</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommandations */}
      {categoryStats.length > 0 && (
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">Recommandations</h4>
          <div className="space-y-3">
            {categoryStats[0] && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>🏆 Catégorie star :</strong> {categoryStats[0].name} génère {((categoryStats[0].revenue / totalRevenue) * 100).toFixed(1)}% 
                  du chiffre d'affaires. Continuez à promouvoir ces produits !
                </p>
              </div>
            )}
            
            {categoryStats.length > 1 && categoryStats[categoryStats.length - 1] && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>📈 Opportunité :</strong> {categoryStats[categoryStats.length - 1].name} a un potentiel d'amélioration. 
                  Considérez des promotions ou une révision de l'offre.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Conseil :</strong> Analysez les heures de pointe pour optimiser la disponibilité des produits 
                des catégories les plus performantes.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesByCategory;