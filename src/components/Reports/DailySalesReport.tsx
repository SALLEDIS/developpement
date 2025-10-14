import React from 'react';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Clock, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';
import { useOrders } from '../../hooks/useOrders';
import { useExpenses } from '../../hooks/useExpenses';

interface DailySalesReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const DailySalesReport: React.FC<DailySalesReportProps> = ({ dateRange }) => {
  const { orders } = useOrders();
  const { expenses } = useExpenses();

  // Filtrer les commandes et charges par période
  const filteredOrders = orders.filter(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0];
    return orderDate >= dateRange.startDate && 
           orderDate <= dateRange.endDate && 
           order.status === 'paid';
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = expense.date.toISOString().split('T')[0];
    return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
  });

  // Calculer les ventes par jour
  const dailySales = filteredOrders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        revenue: 0,
        orders: 0,
        items: 0,
        averageOrderValue: 0,
        paymentMethods: { cash: 0, card: 0, digital: 0 },
      };
    }
    acc[date].revenue += order.total;
    acc[date].orders += 1;
    acc[date].items += order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Méthodes de paiement
    const method = order.paymentMethod || 'cash';
    acc[date].paymentMethods[method] += order.total;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculer les charges par jour
  const dailyExpenses = filteredExpenses.reduce((acc, expense) => {
    const date = expense.date.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, amount: 0, count: 0 };
    }
    acc[date].amount += expense.amount;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, any>);

  // Créer la liste complète des jours
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  const daysList = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const sales = dailySales[dateStr] || { date: dateStr, revenue: 0, orders: 0, items: 0, paymentMethods: { cash: 0, card: 0, digital: 0 } };
    const expenseData = dailyExpenses[dateStr] || { amount: 0, count: 0 };
    
    daysList.push({
      ...sales,
      expenses: expenseData.amount,
      expenseCount: expenseData.count,
      profit: sales.revenue - expenseData.amount,
      averageOrderValue: sales.orders > 0 ? sales.revenue / sales.orders : 0,
    });
  }

  // Statistiques globales
  const totalRevenue = daysList.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = daysList.reduce((sum, day) => sum + day.orders, 0);
  const totalItems = daysList.reduce((sum, day) => sum + day.items, 0);
  const totalExpenses = daysList.reduce((sum, day) => sum + day.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Meilleur et pire jour
  const bestDay = daysList.reduce((best, day) => day.revenue > best.revenue ? day : best, daysList[0] || { revenue: 0 });
  const worstDay = daysList.reduce((worst, day) => day.revenue < worst.revenue && day.revenue > 0 ? day : worst, daysList[0] || { revenue: 0 });

  // Tendance (comparaison première moitié vs seconde moitié)
  const midPoint = Math.floor(daysList.length / 2);
  const firstHalf = daysList.slice(0, midPoint);
  const secondHalf = daysList.slice(midPoint);
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, day) => sum + day.revenue, 0) / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, day) => sum + day.revenue, 0) / secondHalf.length : 0;
  const trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Rapport des ventes journalières</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires (CFA)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-sm text-gray-600">Commandes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Articles vendus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-600">Charges (CFA)</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">Bénéfice (CFA)</div>
          </div>
        </div>
      </Card>

      {/* Tendance et indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              trend === 'up' ? 'bg-green-100' : 
              trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600 transform rotate-180' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Tendance</div>
              <div className={`text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{trendPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Panier moyen</div>
              <div className="text-sm text-blue-600">{averageOrderValue.toFixed(0)} CFA</div>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Articles/commande</div>
              <div className="text-sm text-purple-600">
                {totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : '0'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Graphique des ventes journalières */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Évolution des ventes
        </h4>
        <div className="space-y-3">
          {daysList.map((day, index) => {
            const maxRevenue = Math.max(...daysList.map(d => d.revenue));
            const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
            
            return (
              <div key={day.date} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isWeekend ? 'text-blue-600' : 'text-gray-900'}`}>
                      {new Date(day.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    {isWeekend && <span className="text-xs text-blue-600">Weekend</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{day.orders} cmd</span>
                    <span className="font-semibold">{day.revenue.toLocaleString('fr-FR')} CFA</span>
                    {day.expenses > 0 && (
                      <span className="text-red-600">-{day.expenses.toLocaleString('fr-FR')} CFA</span>
                    )}
                    <span className={`font-semibold ${day.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {day.profit.toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      day.revenue === bestDay.revenue ? 'bg-green-600' :
                      day.revenue === worstDay.revenue && day.revenue > 0 ? 'bg-red-600' :
                      isWeekend ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Détails des meilleurs et pires jours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 text-green-600">🏆 Meilleur jour</h4>
          {bestDay && bestDay.revenue > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Date :</span>
                <span className="font-semibold">
                  {new Date(bestDay.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chiffre d'affaires :</span>
                <span className="font-semibold text-green-600">{bestDay.revenue.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between">
                <span>Commandes :</span>
                <span className="font-semibold">{bestDay.orders}</span>
              </div>
              <div className="flex justify-between">
                <span>Articles vendus :</span>
                <span className="font-semibold">{bestDay.items}</span>
              </div>
              <div className="flex justify-between">
                <span>Panier moyen :</span>
                <span className="font-semibold">{bestDay.averageOrderValue.toFixed(0)} CFA</span>
              </div>
              {bestDay.expenses > 0 && (
                <div className="flex justify-between">
                  <span>Charges :</span>
                  <span className="font-semibold text-red-600">{bestDay.expenses.toLocaleString('fr-FR')} CFA</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span>Bénéfice :</span>
                <span className={`font-semibold ${bestDay.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bestDay.profit.toLocaleString('fr-FR')} CFA
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucune vente sur la période</p>
          )}
        </Card>

        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 text-red-600">📉 Jour le plus faible</h4>
          {worstDay && worstDay.revenue > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Date :</span>
                <span className="font-semibold">
                  {new Date(worstDay.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chiffre d'affaires :</span>
                <span className="font-semibold text-red-600">{worstDay.revenue.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between">
                <span>Commandes :</span>
                <span className="font-semibold">{worstDay.orders}</span>
              </div>
              <div className="flex justify-between">
                <span>Articles vendus :</span>
                <span className="font-semibold">{worstDay.items}</span>
              </div>
              <div className="flex justify-between">
                <span>Panier moyen :</span>
                <span className="font-semibold">{worstDay.averageOrderValue.toFixed(0)} CFA</span>
              </div>
              {worstDay.expenses > 0 && (
                <div className="flex justify-between">
                  <span>Charges :</span>
                  <span className="font-semibold text-red-600">{worstDay.expenses.toLocaleString('fr-FR')} CFA</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span>Bénéfice :</span>
                <span className={`font-semibold ${worstDay.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {worstDay.profit.toLocaleString('fr-FR')} CFA
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucune donnée disponible</p>
          )}
        </Card>
      </div>

      {/* Répartition des paiements */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Répartition des méthodes de paiement</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['cash', 'card', 'digital'].map(method => {
            const total = daysList.reduce((sum, day) => sum + (day.paymentMethods[method] || 0), 0);
            const percentage = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
            const methodText = method === 'cash' ? 'Espèces' : method === 'card' ? 'Carte' : 'Digital';
            
            return (
              <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{total.toLocaleString('fr-FR')}</div>
                <div className="text-sm text-gray-600">{methodText}</div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% du total</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      method === 'cash' ? 'bg-green-600' :
                      method === 'card' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DailySalesReport;