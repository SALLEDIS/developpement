import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, FileText, Printer, DollarSign, Calculator, Users, Clock, Search, X, Tag, Grid3x3 } from 'lucide-react';
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

  const categoryOptions = ['all', ...categories.filter(c => c.isActive).map(c => c.name)];
  const activeProducts = getActiveProducts();

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableTables = getAvailableTables();

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
  const tax = subtotal * 0.1;
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

      addOrder(order);

      if (orderType === 'dine-in' && selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }

      await printService.printTicket(order, cartItems);

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
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de l'impression du ticket:\n${errorMessage}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de l'impression de l'addition:\n${errorMessage}`);
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
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ready': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'served': return 'bg-teal-100 text-teal-700 border-teal-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Section des produits - Main area */}
      <div className="flex-1 space-y-6">
        {/* Header avec types de commande */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Nouvelle commande</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: 'dine-in', label: 'Sur place', icon: Users },
              { value: 'takeaway', label: 'À emporter', icon: ShoppingCart },
              { value: 'delivery', label: 'Livraison', icon: Clock },
              { value: 'kiosk', label: 'Kiosque', icon: Grid3x3 },
            ].map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  className={`p-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    orderType === type.value
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-blue-500 bg-opacity-30 text-white hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tables avec commandes */}
        {tablesWithOrders.length > 0 && (
          <Card className="shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Tables actives</h3>
                <p className="text-sm text-gray-600">{tablesWithOrders.length} table(s) avec commande</p>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {tablesWithOrders.map(tableOrder => {
                const statusColor = getOrderStatusColor(tableOrder.order?.status);
                return (
                  <button
                    key={tableOrder.id}
                    onClick={() => handleTableOrderClick(tableOrder)}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg transform hover:scale-105 ${statusColor} ${
                      selectedOrderForPayment?.id === tableOrder.order?.id ? 'ring-4 ring-blue-400 scale-105' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-lg">T{tableOrder.number}</span>
                      <span className="text-xs font-semibold opacity-75">{tableOrder.order?.items.length} items</span>
                      <span className="text-xs font-bold mt-1">
                        {tableOrder.order?.total.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Barre de recherche et filtres */}
        <Card className="shadow-md">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Tous les produits' : category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Grille des produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingCart className="h-20 w-20 mb-4" />
              <p className="text-xl font-semibold mb-2">
                {activeProducts.length === 0 ? 'Aucun produit disponible' : 'Aucun produit trouvé'}
              </p>
              <p className="text-sm text-center">
                {activeProducts.length === 0
                  ? 'Ajoutez des produits dans la gestion'
                  : 'Modifiez vos filtres de recherche'
                }
              </p>
            </div>
          )}

          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden cursor-pointer"
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Tag className="h-3 w-3 inline text-blue-600 mr-1" />
                  <span className="text-xs font-semibold text-gray-700">{product.category}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 text-base line-clamp-2 min-h-[3rem]">{product.name}</h3>

                {product.sizes ? (
                  <div className="space-y-2">
                    {product.sizes.map((size: any) => (
                      <button
                        key={size.name}
                        onClick={() => addToCart(product, size.name)}
                        className="w-full flex justify-between items-center px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
                      >
                        <span className="text-sm font-medium text-gray-700">{size.name}</span>
                        <span className="font-bold text-blue-600">{size.price.toLocaleString('fr-FR')} CFA</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {product.price.toLocaleString('fr-FR')} CFA
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panier et caisse - Sidebar */}
      <div className="w-full lg:w-96 space-y-6">
        {/* Commande sélectionnée */}
        {selectedOrderForPayment && (
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="h-6 w-6" />
              <h3 className="font-bold text-lg">Commande #{selectedOrderForPayment.orderNumber}</h3>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm opacity-90">
                <span>Table {selectedOrderForPayment.tableId}</span>
                <span>{selectedOrderForPayment.items.length} articles</span>
              </div>
              <div className="text-3xl font-bold">
                {selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA
              </div>
            </div>
            <button
              onClick={() => setSelectedOrderForPayment(null)}
              className="w-full py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-semibold transition-all"
            >
              Annuler la sélection
            </button>
          </div>
        )}

        {/* Sélection table pour nouvelle commande */}
        {!selectedOrderForPayment && orderType === 'dine-in' && (
          <Card className="shadow-md">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Sélectionner une table
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            >
              <option value="">Choisir une table...</option>
              {availableTables.map(table => (
                <option key={table.id} value={table.id}>
                  Table {table.number} - {table.capacity} places - {table.section}
                </option>
              ))}
            </select>
            {availableTables.length === 0 && (
              <p className="text-sm text-amber-600 mt-2 font-medium">
                Aucune table disponible
              </p>
            )}
          </Card>
        )}

        {/* Client */}
        {!selectedOrderForPayment && (
          <Card className="shadow-md">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Client (optionnel)
            </label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = mockCustomers.find(c => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
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
          <Card className="shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-lg">Panier ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                >
                  Vider
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                    {item.size && (
                      <p className="text-sm text-gray-600">{item.size}</p>
                    )}
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} CFA
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-all"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Panier vide</p>
                <p className="text-sm">Ajoutez des produits</p>
              </div>
            )}
          </Card>
        )}

        {/* Note */}
        {!selectedOrderForPayment && cart.length > 0 && (
          <Card className="shadow-md">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Note (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
              rows={2}
            />
          </Card>
        )}

        {/* Total et paiement */}
        {(cart.length > 0 || selectedOrderForPayment) && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between text-white text-opacity-80">
                <span>Sous-total</span>
                <span className="font-semibold">{subtotal.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between text-white text-opacity-80">
                <span>TVA (10%)</span>
                <span className="font-semibold">{tax.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between text-white font-bold text-2xl border-t border-white border-opacity-20 pt-4">
                <span>Total</span>
                <span>{total.toLocaleString('fr-FR')} CFA</span>
              </div>

              <div className="space-y-3 pt-4">
                <h4 className="font-bold text-white text-sm">Paiement</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Espèces', icon: Banknote },
                    { value: 'card', label: 'Carte', icon: CreditCard },
                    { value: 'digital', label: 'Mobile', icon: Smartphone },
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 rounded-xl transition-all ${
                          paymentMethod === method.value
                            ? 'bg-white text-slate-900 shadow-lg'
                            : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs font-semibold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4">
                <button
                  onClick={showTicket}
                  className="px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Ticket
                </button>

                <button
                  onClick={showBill}
                  className="px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Addition
                </button>
              </div>

              <button
                onClick={processPayment}
                disabled={!selectedOrderForPayment && orderType === 'dine-in' && !selectedTableId}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {selectedOrderForPayment
                  ? `Encaisser ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA`
                  : `Encaisser ${total.toLocaleString('fr-FR')} CFA`
                }
              </button>

              {!selectedOrderForPayment && orderType === 'dine-in' && !selectedTableId && (
                <p className="text-xs text-red-400 text-center font-medium">
                  Sélectionnez une table pour continuer
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <Card className="shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <button
              onClick={suspendOrder}
              disabled={cart.length === 0}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 rounded-xl font-semibold text-sm transition-all"
            >
              Suspendre
            </button>
            <button
              onClick={openCashDrawer}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-all"
            >
              Tiroir-caisse
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="w-full px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Nouvelle charge
            </button>
            {isSessionOpen && (
              <button
                onClick={() => setShowCashClosureModal(true)}
                className="w-full px-4 py-3 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Clôture caisse
              </button>
            )}
          </div>
        </Card>
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
