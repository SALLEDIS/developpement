import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Printer, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import OrderDetails from './OrderDetails';
import { Order } from '../../types';
import { useOrders } from '../../hooks/useOrders';

const OrdersManagement: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    deleteOrder,
    getOrdersByStatus,
    getTodaysOrders,
    getActiveOrders
  } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'preparing', label: 'En préparation' },
    { value: 'ready', label: 'Prêt' },
    { value: 'served', label: 'Servi' },
    { value: 'paid', label: 'Payé' },
    { value: 'cancelled', label: 'Annulé' },
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'dine-in', label: 'Sur place' },
    { value: 'takeaway', label: 'À emporter' },
    { value: 'delivery', label: 'Livraison' },
    { value: 'kiosk', label: 'Kiosque' },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'preparing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
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
        return 'En attente';
      case 'preparing':
        return 'En préparation';
      case 'ready':
        return 'Prêt';
      case 'served':
        return 'Servi';
      case 'paid':
        return 'Payé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getTypeText = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return 'Sur place';
      case 'takeaway':
        return 'À emporter';
      case 'delivery':
        return 'Livraison';
      case 'kiosk':
        return 'Kiosque';
      default:
        return type;
    }
  };

  const getTypeColor = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return 'bg-blue-100 text-blue-800';
      case 'takeaway':
        return 'bg-purple-100 text-purple-800';
      case 'delivery':
        return 'bg-orange-100 text-orange-800';
      case 'kiosk':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deleteOrder(orderId);
    }
  };

  const handlePrintOrder = (order: Order) => {
    alert(`Impression de la commande ${order.orderNumber}`);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const todaysOrders = getTodaysOrders();
    const activeOrders = getActiveOrders();
    const pending = getOrdersByStatus('pending').length;
    const preparing = getOrdersByStatus('preparing').length;
    const ready = getOrdersByStatus('ready').length;
    const completed = orders.filter(o => ['served', 'paid'].includes(o.status)).length;

    return { 
      total, 
      today: todaysOrders.length,
      active: activeOrders.length,
      pending, 
      preparing, 
      ready, 
      completed 
    };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques automatisées */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          <div className="text-sm text-gray-600">Aujourd'hui</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Actives</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
          <div className="text-sm text-gray-600">En préparation</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          <div className="text-sm text-gray-600">Prêtes</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          <div className="text-sm text-gray-600">Terminées</div>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par numéro de commande ou produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              iconPosition="left"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Commandes ({filteredOrders.length})
          </h3>
          <Button size="sm" icon={RefreshCw}>
            Actualiser
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-lg font-medium mb-2">
              {orders.length === 0 ? 'Aucune commande' : 'Aucune commande trouvée'}
            </h4>
            <p className="text-sm mb-4">
              {orders.length === 0 
                ? 'Les commandes apparaîtront ici une fois créées dans le point de vente'
                : 'Modifiez vos filtres pour voir d\'autres commandes'
              }
            </p>
            {orders.length === 0 && (
              <Button onClick={() => window.location.hash = '#pos'}>
                Aller au point de vente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Commande</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Articles</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Heure</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        {order.tableId && (
                          <p className="text-sm text-gray-600">Table {order.tableId}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(order.type)}`}>
                        {getTypeText(order.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.items.length} articles</p>
                        <p className="text-sm text-gray-600">
                          {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                          {order.items.length > 2 && '...'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {order.total.toLocaleString('fr-FR')} CFA
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        <p>{order.createdAt.toLocaleDateString('fr-FR')}</p>
                        <p>{order.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintOrder(order)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Imprimer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {order.status !== 'paid' && order.status !== 'cancelled' && (
                          <button
                            className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal des détails de commande */}
      <Modal
        isOpen={isOrderDetailsOpen}
        onClose={() => {
          setIsOrderDetailsOpen(false);
          setSelectedOrder(null);
        }}
        title={`Détails de la commande ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onClose={() => {
              setIsOrderDetailsOpen(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;