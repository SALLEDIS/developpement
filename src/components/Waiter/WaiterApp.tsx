import React, { useState } from 'react';
import { Plus, Users, Clock, CheckCircle, Utensils, Edit } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import WaiterPOS from './WaiterPOS';

const WaiterApp: React.FC = () => {
  const { tables, getAvailableTables } = useTables();
  const { getActiveOrders, getOrdersByStatus } = useOrders();
  const { getActiveProducts } = useProducts();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showPOS, setShowPOS] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);

  const availableTables = getAvailableTables();
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const activeOrders = getActiveOrders();
  const myOrders = activeOrders.filter(o => o.waiterId === user?.id);
  const activeProducts = getActiveProducts();

  const getTableStatus = (table: any) => {
    const order = activeOrders.find(o => o.tableId === table.id);
    if (!order) return { status: 'available', color: 'green', text: 'Libre', order: null };
    
    switch (order.status) {
      case 'pending':
        return { status: 'pending', color: 'amber', text: 'Commande prise', order };
      case 'preparing':
        return { status: 'preparing', color: 'blue', text: 'En préparation', order };
      case 'ready':
        return { status: 'ready', color: 'green', text: 'Prêt à servir', order };
      case 'served':
        return { status: 'served', color: 'purple', text: 'Servi', order };
      default:
        return { status: 'occupied', color: 'red', text: 'Occupée', order };
    }
  };

  const handleTableClick = (table: any) => {
    const tableStatus = getTableStatus(table);
    
    if (tableStatus.status === 'available') {
      // Table libre - nouvelle commande
      setSelectedTable(table);
      setIsAddingToExisting(false);
      setShowPOS(true);
    } else {
      // Table occupée - proposer d'ajouter à la commande existante
      const confirmAdd = confirm(
        `Table ${table.number} est occupée.\n\n` +
        `Commande actuelle: ${tableStatus.order?.orderNumber}\n` +
        `Statut: ${tableStatus.text}\n` +
        `Articles: ${tableStatus.order?.items.length || 0}\n` +
        `Total: ${tableStatus.order?.total.toLocaleString('fr-FR')} CFA\n\n` +
        `Voulez-vous ajouter des articles à cette commande ?`
      );
      
      if (confirmAdd) {
        setSelectedTable(table);
        setIsAddingToExisting(true);
        setShowPOS(true);
      }
    }
  };

  const handleNewOrder = () => {
    setSelectedTable(null);
    setIsAddingToExisting(false);
    setShowPOS(true);
  };

  if (showPOS) {
    return (
      <WaiterPOS
        selectedTable={selectedTable}
        isAddingToExisting={isAddingToExisting}
        existingOrder={isAddingToExisting ? getTableStatus(selectedTable)?.order : null}
        onBack={() => {
          setShowPOS(false);
          setSelectedTable(null);
          setIsAddingToExisting(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-xl lg:text-2xl font-bold text-green-600">{availableTables.length}</div>
          <div className="text-xs lg:text-sm text-gray-600">Tables libres</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xl lg:text-2xl font-bold text-blue-600">{myOrders.length}</div>
          <div className="text-xs lg:text-sm text-gray-600">Mes commandes</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xl lg:text-2xl font-bold text-amber-600">
            {getOrdersByStatus('ready').filter(o => o.waiterId === user?.id).length}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">À servir</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xl lg:text-2xl font-bold text-purple-600">{activeProducts.length}</div>
          <div className="text-xs lg:text-sm text-gray-600">Produits dispo</div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={handleNewOrder}
            className="w-full h-16 flex flex-col items-center justify-center"
            icon={Plus}
          >
            <span className="text-sm lg:text-base">Nouvelle commande</span>
            <span className="text-xs text-blue-200">À emporter / Livraison</span>
          </Button>
          
          <Button
            variant="secondary"
            className="w-full h-16 flex flex-col items-center justify-center"
            icon={Clock}
          >
            <span className="text-sm lg:text-base">Commandes en cours</span>
            <span className="text-xs text-gray-500">{myOrders.length} actives</span>
          </Button>
          
          <Button
            variant="success"
            className="w-full h-16 flex flex-col items-center justify-center"
            icon={CheckCircle}
          >
            <span className="text-sm lg:text-base">Prêtes à servir</span>
            <span className="text-xs text-green-200">
              {getOrdersByStatus('ready').filter(o => o.waiterId === user?.id).length} commandes
            </span>
          </Button>
        </div>
      </Card>

      {/* Plan des tables */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Plan des tables</h3>
          <div className="flex items-center gap-4 text-xs lg:text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Libre</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>Commande prise</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>En préparation</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>À servir</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 lg:gap-4">
          {tables.map((table) => {
            const tableStatus = getTableStatus(table);
            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md bg-${tableStatus.color}-50 border-${tableStatus.color}-200 hover:border-${tableStatus.color}-300 relative`}
              >
                <div className="flex flex-col items-center">
                  <Users className={`h-5 lg:h-6 w-5 lg:w-6 mb-2 text-${tableStatus.color}-600`} />
                  <span className="font-semibold text-sm lg:text-base">Table {table.number}</span>
                  <span className="text-xs text-gray-600">{table.capacity} places</span>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full bg-${tableStatus.color}-100 text-${tableStatus.color}-800`}>
                    {tableStatus.text}
                  </span>
                  
                  {/* Indicateur d'ajout possible */}
                  {tableStatus.status !== 'available' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <Edit className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Astuce :</strong> Cliquez sur une table libre pour créer une nouvelle commande, 
            ou sur une table occupée pour ajouter des articles à la commande existante.
          </p>
        </div>
      </Card>

      {/* Mes commandes actives */}
      {myOrders.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes commandes actives</h3>
          <div className="space-y-3">
            {myOrders.map(order => {
              const orderStatus = getTableStatus({ id: order.tableId });
              return (
                <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className={`p-2 rounded-lg bg-${orderStatus.color}-100`}>
                      <Utensils className={`h-4 lg:h-5 w-4 lg:w-5 text-${orderStatus.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm lg:text-base">#{order.orderNumber}</p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        {order.tableId ? `Table ${order.tableId}` : order.type} • {order.items.length} articles
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${orderStatus.color}-100 text-${orderStatus.color}-800`}>
                      {orderStatus.text}
                    </span>
                    <p className="text-sm lg:text-base font-semibold text-gray-900 mt-1">
                      {order.total.toLocaleString('fr-FR')} CFA
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WaiterApp;