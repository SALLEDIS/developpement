import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../ui/Card';
import { Order } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'served':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'en attente';
      case 'preparing':
        return 'en préparation';
      case 'ready':
        return 'prêt';
      case 'served':
        return 'servi';
      case 'paid':
        return 'payé';
      case 'cancelled':
        return 'annulé';
      default:
        return status;
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes récentes</h3>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  {order.type === 'dine-in' ? 'Sur place' : 
                   order.type === 'takeaway' ? 'À emporter' :
                   order.type === 'delivery' ? 'Livraison' : 'Kiosque'} • {order.items.length} articles
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className="font-semibold text-gray-900">
                {order.total.toLocaleString('fr-FR')} CFA
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentOrders;