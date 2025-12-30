import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, FileText, Printer, DollarSign, Calculator, Users, Clock, Search, X, Tag, Grid3x3, Edit, User, MessageSquare, RotateCcw } from 'lucide-react';
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
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashClosureModal, setShowCashClosureModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'tables' | 'products'>('tables');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const printService = PrintService.getInstance();
  const activeOrders = getActiveOrders();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sections = ['A', 'B', 'C', 'D'];
  const activeProducts = getActiveProducts();
  const displayedProducts = selectedCategory
    ? activeProducts.filter(p => p.category === selectedCategory)
    : activeProducts;

  const tablesWithOrders = tables.map(table => {
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
      type: 'dine-in',
      status: 'pending',
      tableId: selectedTableId,
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

      if (selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }

      await printService.printTicket(order, cartItems);

      const itemCategories = [...new Set(cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category || 'Plats';
      }))];

      await printService.printOrder(cartItems, itemCategories, 'dine-in', selectedTableId);

      alert(`Paiement de ${total.toLocaleString('fr-FR')} CFA traité avec succès !\nTicket et commandes imprimés.`);
      clearCart();
      setShowBillPreview(false);

    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      alert('Erreur lors de l\'impression. Vérifiez les imprimantes.');
    }
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

  const handleTableClick = (table: any) => {
    if (table.order) {
      setSelectedOrderForPayment(table.order);
      setSelectedTableId(table.id);
      setCart([]);
    } else {
      setSelectedTableId(table.id);
      setSelectedOrderForPayment(null);
    }
    setViewMode('products');
    if (categories.length > 0) {
      setSelectedCategory(categories[0].name);
    }
  };

  const sendOrderToPrinters = async () => {
    if (cart.length === 0 || !selectedTableId) {
      alert('Veuillez sélectionner une table et ajouter des articles');
      return;
    }

    try {
      const order = createOrder();
      addOrder(order);

      if (selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }

      const itemsByPrinter: { [key: string]: OrderItem[] } = {};

      cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = categories.find(c => c.name === item.category);

        const printerType = item.printer || product?.printer || category?.printer || 'cuisine';

        if (!itemsByPrinter[printerType]) {
          itemsByPrinter[printerType] = [];
        }
        itemsByPrinter[printerType].push(item);
      });

      for (const [printerType, items] of Object.entries(itemsByPrinter)) {
        console.log(`Envoi de ${items.length} articles à l'imprimante ${printerType}`);
        await printService.printOrder(items, [items[0].category || ''], 'dine-in', selectedTableId);
      }

      alert(`Commande envoyée aux imprimantes !\nTable: ${tables.find(t => t.id === selectedTableId)?.number || selectedTableId}`);
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur lors de l\'envoi aux imprimantes:', error);
      alert('Erreur lors de l\'envoi de la commande aux imprimantes');
    }
  };

  const openCashDrawer = () => {
    alert('Tiroir-caisse ouvert !');
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-800 to-teal-900 border-b border-teal-600">
        <div className="flex items-center gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`w-12 h-10 font-bold text-lg transition-all ${
                selectedSection === section
                  ? 'bg-cyan-400 text-gray-900'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
              } rounded shadow-md`}
            >
              {section}
            </button>
          ))}
          <button
            onClick={() => setViewMode(viewMode === 'tables' ? 'products' : 'tables')}
            className="ml-4 px-6 py-2 bg-gray-600 text-white font-medium rounded shadow-md hover:bg-gray-500 transition-all"
          >
            {viewMode === 'tables' ? 'Mode Produits' : 'Mode Tables en boutons'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all">
            <Edit className="h-5 w-5" />
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-gray-600 transition-all">
            <User className="h-5 w-5" />
            Admin
          </button>
          <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-cyan-600 transition-all shadow-lg">
            <ShoppingCart className="h-5 w-5" />
            Vente directe
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Categories Sidebar - Only shown in products mode */}
        {viewMode === 'products' && selectedTableId && (
          <div className="w-40 bg-gray-700 flex flex-col overflow-y-auto">
            {categories.filter(c => c.isActive).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-4 text-sm font-semibold text-white border-b border-gray-600 hover:bg-gray-600 transition-all ${
                  selectedCategory === category.name ? 'bg-gray-800' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Tables Grid / Products Grid */}
        <div className="flex-1 p-4 overflow-auto">
          {viewMode === 'tables' ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-11 gap-3">
              {tablesWithOrders.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`relative aspect-square rounded-xl font-bold text-2xl transition-all shadow-lg hover:scale-105 ${
                    table.order
                      ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-white text-gray-900'
                  } ${
                    selectedTableId === table.id ? 'ring-4 ring-yellow-400 scale-105' : ''
                  }`}
                >
                  {table.order && (
                    <div className="absolute top-1 left-1 bg-white bg-opacity-90 px-1.5 py-0.5 rounded text-xs font-semibold text-pink-700">
                      {table.order.items.length} CV
                    </div>
                  )}
                  <span>{table.number}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden cursor-pointer"
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
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-base line-clamp-2 min-h-[3rem]">{product.name}</h3>

                    {product.sizes ? (
                      <div className="space-y-2">
                        {product.sizes.map((size: any) => (
                          <button
                            key={size.name}
                            onClick={() => addToCart(product, size.name)}
                            className="w-full flex justify-between items-center px-3 py-2 bg-gray-50 hover:bg-cyan-50 rounded-lg transition-all border border-gray-200 hover:border-cyan-300"
                          >
                            <span className="text-sm font-medium text-gray-700">{size.name}</span>
                            <span className="font-bold text-cyan-600">{size.price.toLocaleString('fr-FR')} CFA</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-md"
                      >
                        {product.price.toLocaleString('fr-FR')} CFA
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 border-b border-pink-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {selectedTableId
                ? `Table: ${tables.find(t => t.id === selectedTableId)?.number || '?'} / ${cart.length} CV`
                : 'Tables ?'}
            </h2>
            <button
              onClick={() => {
                clearCart();
                setViewMode('tables');
              }}
              className="text-white hover:text-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Items List Header */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 grid grid-cols-12 gap-2 font-semibold text-sm text-gray-700">
            <div className="col-span-9">Article</div>
            <div className="col-span-3 text-right">Qté</div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-auto bg-white">
            {selectedOrderForPayment && selectedOrderForPayment.items.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {selectedOrderForPayment.items.map(item => (
                  <div key={item.id} className="px-4 py-3 grid grid-cols-12 gap-2 hover:bg-gray-50">
                    <div className="col-span-9">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      {item.size && (
                        <p className="text-xs text-gray-600">{item.size}</p>
                      )}
                      <p className="text-sm text-gray-600">{item.price.toLocaleString('fr-FR')} CFA</p>
                    </div>
                    <div className="col-span-3 text-right font-bold text-gray-900">{item.quantity}</div>
                  </div>
                ))}
              </div>
            ) : cart.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {cart.map(item => (
                  <div key={item.id} className="px-4 py-3 grid grid-cols-12 gap-2 hover:bg-gray-50">
                    <div className="col-span-9">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      {item.size && (
                        <p className="text-xs text-gray-600">{item.size}</p>
                      )}
                      <p className="text-sm text-gray-600">{item.price.toLocaleString('fr-FR')} CFA</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun article</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-300 px-4 py-3 bg-gray-50">
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => updateQuantity(cart[cart.length - 1]?.id, (cart[cart.length - 1]?.quantity || 0) + 1)}
                disabled={cart.length === 0}
                className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <Calculator className="h-5 w-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Quantité</span>
              </button>
              <button
                onClick={clearCart}
                className="px-3 py-2 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all flex flex-col items-center gap-1"
              >
                <X className="h-5 w-5 text-red-600" />
                <span className="text-xs font-medium text-red-600">Supprimer</span>
              </button>
              <button
                disabled={cart.length === 0}
                className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="h-5 w-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Remise</span>
              </button>
              <button
                disabled={cart.length === 0}
                className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <MessageSquare className="h-5 w-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Remarque</span>
              </button>
            </div>

            {/* Clock */}
            <div className="mb-3 text-center">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2 rounded-lg">
                <div className="text-3xl font-bold text-white font-mono tracking-wider">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => {
                  if (selectedCustomer) {
                    alert('Client: ' + selectedCustomer.name);
                  } else {
                    alert('Aucun client sélectionné');
                  }
                }}
                className="px-3 py-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg flex flex-col items-center gap-2"
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-bold">Client</span>
              </button>
              <button
                onClick={() => setViewMode('products')}
                className="px-3 py-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex flex-col items-center gap-2"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-bold">A Suivre..</span>
              </button>
              <button
                onClick={printBill}
                disabled={cart.length === 0}
                className="px-3 py-4 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <Minus className="h-6 w-6" />
                <span className="text-sm font-bold">Séparateur</span>
              </button>
              <button
                onClick={sendOrderToPrinters}
                disabled={cart.length === 0 || !selectedTableId}
                className="px-3 py-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <Printer className="h-6 w-6" />
                <span className="text-sm font-bold">Fabrication</span>
              </button>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl px-6 py-4 mb-3 text-center shadow-lg">
              <div className="text-white text-sm font-medium mb-1">Total</div>
              <div className="text-white text-4xl font-bold">
                {total.toLocaleString('fr-FR')} CFA
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={openCashDrawer}
                className="px-3 py-4 bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-lg hover:from-teal-800 hover:to-teal-900 transition-all shadow-md flex flex-col items-center gap-2"
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-xs font-bold">Tiroir</span>
              </button>
              <button
                disabled={cart.length === 0}
                className="px-3 py-4 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all shadow-md flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <Clock className="h-6 w-6" />
                <span className="text-xs font-bold">Attente</span>
              </button>
              <button
                onClick={processPayment}
                disabled={(cart.length === 0 && !selectedOrderForPayment)}
                className="px-3 py-4 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-bold">Paiement</span>
              </button>
            </div>
          </div>
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
        onPrint={printTicket}
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
