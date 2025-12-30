import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, FileText, Printer, DollarSign, Calculator, Users, Clock, Search, X, Tag, Grid3x3, Edit, User, MessageSquare, RotateCcw, Scale, Wifi } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`w-14 h-11 font-bold text-base transition-all rounded-lg ${
                selectedSection === section
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section}
            </button>
          ))}
          <div className="ml-4 h-8 w-px bg-gray-300"></div>
          <button
            onClick={() => setViewMode(viewMode === 'tables' ? 'products' : 'tables')}
            className="ml-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            {viewMode === 'tables' ? 'Produits' : 'Tables'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <div className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</div>
            <div className="text-xs text-gray-500">Caissier</div>
          </div>
          <button className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
            <Edit className="h-5 w-5" />
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm">
            <ShoppingCart className="h-5 w-5" />
            Vente directe
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Categories Sidebar - Only shown in products mode */}
        {viewMode === 'products' && selectedTableId && (
          <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shadow-sm">
            {categories.filter(c => c.isActive).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-5 py-4 text-sm font-semibold border-b border-gray-100 hover:bg-gray-50 transition-all text-left ${
                  selectedCategory === category.name
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600'
                    : 'text-gray-700'
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
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {displayedProducts.map(product => (
                product.sizes ? (
                  product.sizes.map((size: any) => (
                    <button
                      key={`${product.id}-${size.name}`}
                      onClick={() => addToCart(product, size.name)}
                      className="bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center justify-between min-h-[130px] group"
                    >
                      <div className="text-center font-semibold text-sm text-gray-800 leading-tight mb-3 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-center w-full">
                        <div className="text-xs text-gray-500 mb-1">{size.name}</div>
                        <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                          {size.price.toLocaleString('fr-FR')} CFA
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center justify-between min-h-[130px] group"
                  >
                    <div className="text-center font-semibold text-sm text-gray-800 leading-tight mb-3 line-clamp-2">
                      {product.name}
                    </div>
                    <div className="text-center w-full">
                      <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                        {product.price.toLocaleString('fr-FR')} CFA
                      </div>
                    </div>
                  </button>
                )
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[500px] bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {selectedTableId
                    ? `Table ${tables.find(t => t.id === selectedTableId)?.number || '?'}`
                    : 'Commande'}
                </h2>
                <p className="text-xs text-blue-100">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => {
                clearCart();
                setViewMode('tables');
              }}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List Header */}
          <div className="bg-gray-50 px-5 py-2.5 border-b border-gray-200 grid grid-cols-12 gap-3 font-semibold text-xs text-gray-600 uppercase tracking-wider">
            <div className="col-span-5">Article</div>
            <div className="col-span-2 text-center">Qté</div>
            <div className="col-span-3 text-right">Total</div>
            <div className="col-span-2 text-right">-</div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-auto bg-white">
            {selectedOrderForPayment && selectedOrderForPayment.items.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {selectedOrderForPayment.items.map(item => (
                  <div key={item.id} className="px-5 py-3 grid grid-cols-12 gap-3 hover:bg-gray-50 text-sm">
                    <div className="col-span-5">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center font-semibold text-gray-700">{item.quantity}</div>
                    <div className="col-span-3 text-right font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('fr-FR')}
                    </div>
                    <div className="col-span-2"></div>
                  </div>
                ))}
              </div>
            ) : cart.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="px-5 py-3 grid grid-cols-12 gap-3 hover:bg-gray-50 text-sm">
                    <div className="col-span-5">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 rounded transition-all flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-100 hover:bg-green-100 hover:text-green-600 text-gray-600 rounded transition-all flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('fr-FR')}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Aucun article</p>
                  <p className="text-xs mt-1">Sélectionnez une table et ajoutez des produits</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 space-y-3">
            {/* Clock */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div className="text-lg font-mono font-bold text-gray-900">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-5 w-5" />
                <span className="text-sm font-medium">Vider panier</span>
              </button>
              <button
                onClick={sendOrderToPrinters}
                disabled={cart.length === 0 || !selectedTableId}
                className="px-4 py-3 bg-orange-500 border border-orange-600 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <Printer className="h-5 w-5" />
                <span className="text-sm font-medium">Envoyer</span>
              </button>
            </div>

            {/* Total */}
            <div className="bg-white border-2 border-blue-600 rounded-xl p-5 shadow-sm">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total à payer</span>
                <span className="text-xs text-gray-500">{cart.length} article{cart.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {total.toLocaleString('fr-FR')}
                </span>
                <span className="text-lg font-semibold text-gray-500">CFA</span>
              </div>
              {subtotal > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Sous-total: {subtotal.toLocaleString('fr-FR')}</span>
                  <span>TVA: {tax.toLocaleString('fr-FR')}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={printBill}
                disabled={cart.length === 0 && !selectedOrderForPayment}
                className="px-4 py-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Receipt className="h-5 w-5" />
                <span className="text-sm font-medium">Addition</span>
              </button>
              <button
                onClick={openCashDrawer}
                className="px-4 py-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Tiroir</span>
              </button>
              <button
                onClick={processPayment}
                disabled={(cart.length === 0 && !selectedOrderForPayment)}
                className="px-4 py-4 bg-green-600 border border-green-700 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">Paiement</span>
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
