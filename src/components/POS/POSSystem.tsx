import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, FileText, Printer, DollarSign, Calculator, Users, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import BillPreview from './BillPreview';
import TicketPreview from './TicketPreview';
import ExpenseModal from './ExpenseModal';
import CashClosureModal from './CashClosureModal';
import PrintService from '../../services/PrintService';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';
import { useAuth } from '../../hooks/useAuth';
import { useCashSession } from '../../hooks/useCashSession';
import { OrderItem, Customer, Order } from '../../types';
import { mockCustomers } from '../../data/mockData';

const POSSystem: React.FC = () => {
  const { products, categories, getActiveProducts } = useProducts();
  const { addOrder, getActiveOrders, updateOrderStatus } = useOrders();
  const { tables, getAvailableTables, updateTableStatus } = useTables();
  const { user } = useAuth();
  const { isSessionOpen } = useCashSession();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashClosureModal, setShowCashClosureModal] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery' | 'kiosk'>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  const printService = PrintService.getInstance();
  const activeOrders = getActiveOrders();

  // Obtenir les catégories actives avec "all"
  const categoryOptions = ['all', ...categories.filter(c => c.isActive).map(c => c.name)];

  // Filtrer les produits actifs
  const activeProducts = getActiveProducts();
  
  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les tables disponibles
  const availableTables = getAvailableTables();

  // Tables avec commandes en priorité
  const tablesWithOrders = tables.filter(table => {
    return activeOrders.some(order => order.tableId === table.id);
  }).map(table => {
    const order = activeOrders.find(o => o.tableId === table.id);
    return { ...table, order };
  });

  const addToCart = (product: any, size?: string) => {
    const price = size && product.sizes 
      ? product.sizes.find((s: any) => s.name === size)?.price || product.price
      : product.price;

    const existingItem = cart.find(item => 
      item.productId === product.id && item.size === size
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price,
        size,
        category: product.category,
        printer: product.printer,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setNotes('');
    setSelectedTableId('');
    setSelectedOrderForPayment(null);
  };

  const subtotal = cart.length > 0 ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 
                   selectedOrderForPayment ? selectedOrderForPayment.total : 0;
  const tax = subtotal * 0.1; // 10% TVA
  const total = subtotal + tax;

  const createOrder = (): Order => {
    return {
      id: Date.now().toString(),
      orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
      type: orderType,
      status: 'pending',
      tableId: orderType === 'dine-in' ? selectedTableId : undefined,
      customerId: selectedCustomer?.id,
      waiterId: user?.id,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
    };
  };

  const processPayment = async () => {
    if (selectedOrderForPayment) {
      // Paiement d'une commande existante
      updateOrderStatus(selectedOrderForPayment.id, 'paid');
      
      if (selectedOrderForPayment.tableId) {
        updateTableStatus(selectedOrderForPayment.tableId, 'available');
      }
      
      alert(`Paiement de ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA traité avec succès !`);
      clearCart();
      setShowBillPreview(false);
      return;
    }

    if (cart.length === 0) return;

    try {
      const order = createOrder();
      const cartItems = [...cart];
      
      // Ajouter la commande à la base de données
      addOrder(order);
      
      // Marquer la table comme occupée si c'est une commande sur place
      if (orderType === 'dine-in' && selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }
      
      // Imprimer le ticket de caisse
      await printService.printTicket(order, cartItems);
      
      // Imprimer les commandes aux différentes imprimantes
      const itemCategories = [...new Set(cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category || 'Plats';
      }))];
      
      await printService.printOrder(cartItems, itemCategories, orderType, selectedTableId);
      
      alert(`Paiement de ${total.toLocaleString('fr-FR')} CFA traité avec succès !\nTicket et commandes imprimés.`);
      clearCart();
      setShowBillPreview(false);
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      alert('Erreur lors de l\'impression. Vérifiez les imprimantes.');
    }
  };

  const suspendOrder = () => {
    if (cart.length === 0) return;
    alert('Commande suspendue avec succès !');
    clearCart();
  };

  const printTicket = async () => {
    if (cart.length === 0) return;
    
    try {
      const order = createOrder();
      const cartItems = [...cart];
      await printService.printTicket(order, cartItems);
      alert('Ticket imprimé avec succès !');
    } catch (error) {
      console.error('Erreur d\'impression:', error);
      alert('Erreur lors de l\'impression du ticket. Vérifiez l\'imprimante de caisse.');
    }
  };

  const printBill = async () => {
    if (cart.length === 0) return;
    
    try {
      const order = createOrder();
      const cartItems = [...cart];
      await printService.printBill(order, cartItems, selectedCustomer?.name);
      alert('Addition imprimée avec succès !');
    } catch (error) {
      console.error('Erreur d\'impression:', error);
      alert('Erreur lors de l\'impression de l\'addition. Vérifiez l\'imprimante de caisse.');
    }
  };

  const handlePrintTicket = async () => {
    await printTicket();
    setShowTicketPreview(false);
  };

  const openCashDrawer = () => {
    alert('Tiroir-caisse ouvert !');
  };

  const showBill = () => {
    if (cart.length === 0 && !selectedOrderForPayment) return;
    setShowBillPreview(true);
  };

  const showTicket = () => {
    if (cart.length === 0 && !selectedOrderForPayment) return;
    setShowTicketPreview(true);
  };

  const handleTableOrderClick = (tableOrder: any) => {
    setSelectedOrderForPayment(tableOrder.order);
    setSelectedTableId(tableOrder.id);
    setOrderType('dine-in');
    setCart([]);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'amber';
      case 'preparing': return 'blue';
      case 'ready': return 'green';
      case 'served': return 'purple';
      default: return 'gray';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prêt';
      case 'served': return 'Servi';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row-reverse h-full gap-4 lg:gap-6">
      {/* Panier et caisse - Responsive */}
      <div className="w-full lg:w-80 space-y-3">
        {/* Commande sélectionnée */}
        {selectedOrderForPayment && (
          <Card padding="sm" className="border-blue-200 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Commande sélectionnée
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>N° {selectedOrderForPayment.orderNumber}</span>
                <span className="font-medium">Table {selectedOrderForPayment.tableId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{selectedOrderForPayment.items.length} articles</span>
                <span className="font-bold text-blue-900">
                  {selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForPayment(null)}
                className="w-full text-xs text-blue-700 hover:text-blue-900 mt-2"
              >
                Annuler la sélection
              </button>
            </div>
          </Card>
        )}

        {/* Type de commande */}
        {!selectedOrderForPayment && (
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Type de commande</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { value: 'dine-in', label: 'Sur place' },
                { value: 'takeaway', label: 'À emporter' },
                { value: 'delivery', label: 'Livraison' },
                { value: 'kiosk', label: 'Kiosque' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  className={`p-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    orderType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            {orderType === 'dine-in' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une table</option>
                  {availableTables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} ({table.capacity} places) - {table.section}
                    </option>
                  ))}
                </select>
                {availableTables.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Aucune table disponible
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Informations client */}
        {!selectedOrderForPayment && (
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Client</h3>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = mockCustomers.find(c => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Client occasionnel</option>
              {mockCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Card>
        )}

        {/* Panier */}
        {!selectedOrderForPayment && (
          <Card padding="sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Commande</h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Vider
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    {item.size && (
                      <p className="text-xs text-gray-600">{item.size}</p>
                    )}
                    <p className="text-xs text-gray-600">{item.price.toLocaleString('fr-FR')} CFA × {item.quantity}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 lg:gap-2 ml-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <ShoppingCart className="h-8 lg:h-12 w-8 lg:w-12 mx-auto mb-2" />
                <p className="text-sm">Panier vide</p>
              </div>
            )}
          </Card>
        )}

        {/* Notes */}
        {!selectedOrderForPayment && (
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Note interne</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={2}
            />
          </Card>
        )}

        {/* Total et paiement */}
        {(cart.length > 0 || selectedOrderForPayment) && (
          <Card padding="sm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (10%)</span>
                <span>{tax.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between font-bold text-base lg:text-lg border-t pt-2">
                <span>Total</span>
                <span>{total.toLocaleString('fr-FR')} CFA</span>
              </div>

              {/* Méthodes de paiement */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Méthode de paiement</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 lg:p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="h-4 lg:h-6 w-4 lg:w-6 mx-auto mb-1" />
                    <span className="text-xs">Espèces</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 lg:p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-4 lg:h-6 w-4 lg:w-6 mx-auto mb-1" />
                    <span className="text-xs">Carte</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('digital')}
                    className={`p-2 lg:p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'digital'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="h-4 lg:h-6 w-4 lg:w-6 mx-auto mb-1" />
                    <span className="text-xs">Digital</span>
                  </button>
                </div>
              </div>

              {/* Boutons d'impression */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={showTicket}
                  variant="secondary"
                  className="w-full"
                  icon={Receipt}
                  size="sm"
                >
                  Ticket
                </Button>
                
                <Button
                  onClick={showBill}
                  variant="secondary"
                  className="w-full"
                  icon={FileText}
                  size="sm"
                >
                  Addition
                </Button>
              </div>

              <Button
                onClick={processPayment}
                className="w-full"
                size="lg"
                disabled={!selectedOrderForPayment && orderType === 'dine-in' && !selectedTableId}
              >
                {selectedOrderForPayment 
                  ? `Encaisser ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA`
                  : `Encaisser ${total.toLocaleString('fr-FR')} CFA`
                }
              </Button>
              
              {!selectedOrderForPayment && orderType === 'dine-in' && !selectedTableId && (
                <p className="text-xs text-red-600 text-center">
                  Veuillez sélectionner une table pour continuer
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card padding="sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              className="w-full" 
              size="sm"
              onClick={suspendOrder}
              disabled={cart.length === 0}
            >
              Suspendre la commande
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              size="sm"
              onClick={printTicket}
              disabled={cart.length === 0}
              icon={Printer}
            >
              Imprimer ticket
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              size="sm"
              onClick={printBill}
              disabled={cart.length === 0}
              icon={Printer}
            >
              Imprimer addition
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              size="sm"
              onClick={openCashDrawer}
            >
              Ouvrir tiroir-caisse
            </Button>
            <Button 
              variant="warning" 
              className="w-full" 
              size="sm"
              onClick={() => setShowExpenseModal(true)}
              icon={DollarSign}
            >
              Nouvelle charge
            </Button>
            {isSessionOpen && (
              <Button 
                variant="danger" 
                className="w-full" 
                size="sm"
                onClick={() => setShowCashClosureModal(true)}
                icon={Calculator}
              >
                Clôture de caisse
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Section des produits */}
      <div className="flex-1 space-y-4">
        {/* Tables avec commandes en priorité */}
        {tablesWithOrders.length > 0 && (
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Tables avec commandes ({tablesWithOrders.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-1.5">
              {tablesWithOrders.map(tableOrder => {
                const statusColor = getOrderStatusColor(tableOrder.order?.status);
                return (
                  <button
                    key={tableOrder.id}
                    onClick={() => handleTableOrderClick(tableOrder)}
                    className={`p-2 rounded-lg border-2 transition-all hover:shadow-md bg-${statusColor}-50 border-${statusColor}-200 hover:border-${statusColor}-300 ${
                      selectedOrderForPayment?.id === tableOrder.order?.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Users className={`h-3 w-3 mb-0.5 text-${statusColor}-600`} />
                      <span className="font-semibold text-xs">T{tableOrder.number}</span>
                      <span className="text-xs text-gray-600">{tableOrder.order?.items.length}</span>
                      <span className={`text-xs px-1 py-0.5 rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                        {getOrderStatusText(tableOrder.order?.status)}
                      </span>
                      <span className="text-xs font-semibold">
                        {tableOrder.order?.total.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Filtres */}
        <Card padding="sm">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categoryOptions.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>

          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
        </Card>

        {/* Grille des produits - Responsive */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 lg:py-12 text-gray-500">
              <ShoppingCart className="h-12 lg:h-16 w-12 lg:w-16 mb-4" />
              <p className="text-sm lg:text-lg font-medium">
                {activeProducts.length === 0 ? 'Aucun produit disponible' : 'Aucun produit trouvé'}
              </p>
              <p className="text-xs lg:text-sm text-center">
                {activeProducts.length === 0
                  ? 'Ajoutez des produits dans la section "Gestion des produits"'
                  : 'Modifiez vos filtres ou ajoutez des produits'
                }
              </p>
            </div>
          )}

          {filteredProducts.map(product => (
            <Card key={product.id} padding="sm" className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 rounded-md mb-1.5 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <img
                    src={`https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop`}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs line-clamp-1">{product.name}</h3>

              {product.sizes ? (
                <div className="space-y-0.5">
                  {product.sizes.map((size: any) => (
                    <button
                      key={size.name}
                      onClick={() => addToCart(product, size.name)}
                      className="w-full flex justify-between items-center px-1.5 py-1 bg-gray-50 hover:bg-blue-50 rounded text-xs transition-colors"
                    >
                      <span className="text-xs">{size.name}</span>
                      <span className="font-semibold text-xs">{size.price.toLocaleString('fr-FR')}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 text-white py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  {product.price.toLocaleString('fr-FR')}
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Modales */}
      <BillPreview
        isOpen={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        items={selectedOrderForPayment ? selectedOrderForPayment.items : cart}
        customer={selectedCustomer}
        notes={selectedOrderForPayment ? selectedOrderForPayment.notes || '' : notes}
        subtotal={selectedOrderForPayment ? selectedOrderForPayment.subtotal : subtotal}
        tax={selectedOrderForPayment ? selectedOrderForPayment.tax : tax}
        total={selectedOrderForPayment ? selectedOrderForPayment.total : total}
        paymentMethod={paymentMethod}
        onProceedToPayment={processPayment}
        onPrintBill={printBill}
      />

      <TicketPreview
        isOpen={showTicketPreview}
        onClose={() => setShowTicketPreview(false)}
        items={selectedOrderForPayment ? selectedOrderForPayment.items : cart}
        customer={selectedCustomer}
        notes={selectedOrderForPayment ? selectedOrderForPayment.notes || '' : notes}
        subtotal={selectedOrderForPayment ? selectedOrderForPayment.subtotal : subtotal}
        tax={selectedOrderForPayment ? selectedOrderForPayment.tax : tax}
        total={selectedOrderForPayment ? selectedOrderForPayment.total : total}
        paymentMethod={paymentMethod}
        onPrint={handlePrintTicket}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <CashClosureModal
        isOpen={showCashClosureModal}
        onClose={() => setShowCashClosureModal(false)}
      />
    </div>
  );
};

export default POSSystem;