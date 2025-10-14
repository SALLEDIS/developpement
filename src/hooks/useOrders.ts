import { useState, useEffect, createContext, useContext } from 'react';
import { Order, OrderItem } from '../types';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByType: (type: Order['type']) => Order[];
  getTodaysOrders: () => Order[];
  getTodaysSales: () => number;
  getActiveOrders: () => Order[];
  getRecentOrders: (limit?: number) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders doit être utilisé dans un OrderProvider');
  }
  return context;
};

export const useOrderProvider = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (!isInitialized) {
      console.log('useOrders - Initialisation du hook');
      
      const storedOrders = localStorage.getItem('restobar_orders');
      if (storedOrders) {
        try {
          const parsedOrders = JSON.parse(storedOrders);
          if (Array.isArray(parsedOrders)) {
            // Convertir les dates string en objets Date
            const ordersWithDates = parsedOrders.map(order => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
            }));
            setOrders(ordersWithDates);
            console.log('useOrders - Commandes chargées depuis localStorage:', ordersWithDates.length);
          }
        } catch (error) {
          console.error('useOrders - Erreur lors du chargement des commandes:', error);
          setOrders([]);
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Sauvegarder automatiquement les commandes
  useEffect(() => {
    if (isInitialized && orders.length >= 0) {
      try {
        const ordersJson = JSON.stringify(orders);
        const currentStored = localStorage.getItem('restobar_orders');
        
        if (currentStored !== ordersJson) {
          localStorage.setItem('restobar_orders', ordersJson);
          console.log('useOrders - Commandes sauvegardées automatiquement:', orders.length);
        }
      } catch (error) {
        console.error('useOrders - Erreur lors de la sauvegarde des commandes:', error);
      }
    }
  }, [orders, isInitialized]);

  const addOrder = (orderData: Omit<Order, 'id'>) => {
    try {
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
      };
      
      setOrders(prev => {
        const updatedOrders = [...prev, newOrder];
        console.log('useOrders - Nouvelle commande ajoutée:', newOrder.orderNumber, 'Total:', updatedOrders.length);
        return updatedOrders;
      });
    } catch (error) {
      console.error('useOrders - Erreur lors de l\'ajout de la commande:', error);
    }
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    try {
      setOrders(prev => {
        const updatedOrders = prev.map(o => 
          o.id === id ? { ...o, ...orderData, updatedAt: new Date() } : o
        );
        console.log('useOrders - Commande mise à jour:', id);
        return updatedOrders;
      });
    } catch (error) {
      console.error('useOrders - Erreur lors de la mise à jour de la commande:', error);
    }
  };

  const deleteOrder = (id: string) => {
    try {
      setOrders(prev => {
        const updatedOrders = prev.filter(o => o.id !== id);
        console.log('useOrders - Commande supprimée, Total restant:', updatedOrders.length);
        return updatedOrders;
      });
    } catch (error) {
      console.error('useOrders - Erreur lors de la suppression de la commande:', error);
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    updateOrder(id, { status });
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(o => o.status === status);
  };

  const getOrdersByType = (type: Order['type']) => {
    return orders.filter(o => o.type === type);
  };

  const getTodaysOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });
  };

  const getTodaysSales = () => {
    const todaysOrders = getTodaysOrders();
    return todaysOrders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
  };

  const getActiveOrders = () => {
    return orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  };

  const getRecentOrders = (limit: number = 10) => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getOrdersByStatus,
    getOrdersByType,
    getTodaysOrders,
    getTodaysSales,
    getActiveOrders,
    getRecentOrders,
  };
};

export { OrderContext };