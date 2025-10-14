import React from 'react';
import { Package, TrendingUp, Star, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';

interface SalesByProductProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const SalesByProduct: React.FC<SalesByProductProps> = ({ dateRange }) => {
  const { orders } = useOrders();
  const { products } = useProducts();

  // Filtrer les commandes par période
  const filteredOrders = orders.filter(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0];
    return orderDate >= dateRange.startDate && 
           orderDate <= dateRange.endDate && 
           order.status === 'paid';
  });

  // Calculer les ventes par produit
  const salesByProduct = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const productId = item.productId;
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: item.productName,
          category: item.category || 'Autres',
          quantity: 0,
          revenue: 0,
          orders: new Set(),
          sizes: {},
        };
      }
      acc[productId].quantity += item.quantity;
      acc[productId].revenue += item.price * item.quantity;
      acc[productId].orders.add(order.id);
      
      // Suivi des tailles
      if (item.size) {
        if (!acc[productId].sizes[item.size]) {
          acc[productId].sizes[item.size] = 0;
        }
        acc[productId].sizes[item.size] += item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, { 
    productId: string; 
    productName: string; 
    category: string;
    quantity: number; 
    revenue: number; 
    orders: Set<string>;
    sizes: Record<string, number>;
  }>);

  const productStats = Object.values(salesByProduct).map(product => ({
    ...product,
    orderCount: product.orders.size,
    averageOrderValue: product.revenue / product.orders.size || 0,
    averageQuantityPerOrder: product.quantity / product.orders.size || 0,
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = productStats.reduce((sum, product) => sum + product.revenue, 0);
  const totalQuantity = productStats.reduce((sum, product) => sum + product.quantity, 0);

  // Top 10 produits
  const topProducts = productStats.slice(0, 10);
  
  // Produits peu performants
  const lowPerformingProducts = productStats.slice(-5).reverse();

  // Produits non vendus
  const soldProductIds = new Set(productStats.map(p => p.productId));
  const unsoldProducts = products.filter(p => p.isActive && !soldProductIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ventes par article</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires (CFA)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalQuantity}</div>
            <div className="text-sm text-gray-600">Articles vendus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{productStats.length}</div>
            <div className="text-sm text-gray-600">Produits vendus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{unsoldProducts.length}</div>
            <div className="text-sm text-gray-600">Produits non vendus</div>
          </div>
        </div>
      </Card>

      {/* Top 10 des produits */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Top 10 des produits les plus vendus
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-900">Rang</th>
                <th className="text-left py-3 font-medium text-gray-900">Produit</th>
                <th className="text-left py-3 font-medium text-gray-900">Catégorie</th>
                <th className="text-right py-3 font-medium text-gray-900">Quantité</th>
                <th className="text-right py-3 font-medium text-gray-900">Chiffre d'affaires</th>
                <th className="text-right py-3 font-medium text-gray-900">Commandes</th>
                <th className="text-right py-3 font-medium text-gray-900">Moy/Cmd</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      {Object.keys(product.sizes).length > 0 && (
                        <p className="text-xs text-gray-500">
                          Tailles: {Object.entries(product.sizes).map(([size, qty]) => `${size}(${qty})`).join(', ')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="text-right py-3 font-semibold">{product.quantity}</td>
                  <td className="text-right py-3 font-semibold text-green-600">
                    {product.revenue.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="text-right py-3">{product.orderCount}</td>
                  <td className="text-right py-3">{product.averageQuantityPerOrder.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Analyse détaillée des top 3 */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Analyse détaillée - Top 3</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProducts.slice(0, 3).map((product, index) => {
            const revenuePercentage = totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;
            return (
              <div key={product.productId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-amber-600'
                  }`}>
                    {index + 1}
                  </span>
                  <h5 className="font-semibold text-gray-900">{product.productName}</h5>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Chiffre d'affaires :</span>
                    <span className="font-semibold text-green-600">
                      {product.revenue.toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part du CA :</span>
                    <span className="font-semibold">{revenuePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantité vendue :</span>
                    <span className="font-semibold">{product.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commandes :</span>
                    <span className="font-semibold">{product.orderCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moy. par commande :</span>
                    <span className="font-semibold">{product.averageQuantityPerOrder.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur moy. commande :</span>
                    <span className="font-semibold">{product.averageOrderValue.toFixed(0)} CFA</span>
                  </div>
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

      {/* Produits peu performants */}
      {lowPerformingProducts.length > 0 && (
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Produits à faible performance
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-900">Produit</th>
                  <th className="text-left py-3 font-medium text-gray-900">Catégorie</th>
                  <th className="text-right py-3 font-medium text-gray-900">Quantité</th>
                  <th className="text-right py-3 font-medium text-gray-900">Chiffre d'affaires</th>
                  <th className="text-right py-3 font-medium text-gray-900">Commandes</th>
                </tr>
              </thead>
              <tbody>
                {lowPerformingProducts.map((product) => (
                  <tr key={product.productId} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{product.productName}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="text-right py-3">{product.quantity}</td>
                    <td className="text-right py-3">{product.revenue.toLocaleString('fr-FR')} CFA</td>
                    <td className="text-right py-3">{product.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Produits non vendus */}
      {unsoldProducts.length > 0 && (
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Produits non vendus ({unsoldProducts.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unsoldProducts.slice(0, 12).map((product) => (
              <div key={product.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-medium text-gray-900">{product.name}</h5>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm font-semibold text-red-600">{product.price.toLocaleString('fr-FR')} CFA</p>
              </div>
            ))}
          </div>
          {unsoldProducts.length > 12 && (
            <p className="text-sm text-gray-500 mt-3">
              Et {unsoldProducts.length - 12} autres produits non vendus...
            </p>
          )}
        </Card>
      )}

      {/* Recommandations */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Recommandations</h4>
        <div className="space-y-3">
          {topProducts[0] && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>🏆 Produit star :</strong> {topProducts[0].productName} génère {((topProducts[0].revenue / totalRevenue) * 100).toFixed(1)}% 
                du chiffre d'affaires. Assurez-vous d\'avoir toujours ce produit en stock !
              </p>
            </div>
          )}
          
          {unsoldProducts.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Attention :</strong> {unsoldProducts.length} produits n'ont généré aucune vente. 
                Considérez une révision des prix, une promotion ou un retrait du menu.
              </p>
            </div>
          )}
          
          {lowPerformingProducts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>📈 Opportunité :</strong> Plusieurs produits ont une faible performance. 
                Analysez les raisons (prix, visibilité, qualité) et mettez en place des actions correctives.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SalesByProduct;