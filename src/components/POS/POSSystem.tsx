import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Printer, Receipt, DollarSign, Clock, X, Users, Tag } from 'lucide-react';
import Modal from '../ui/Modal';
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

const POSSystem: React.FC = () => {
  const { products, categories, getActiveProducts } = useProducts();
  const { addOrder, getActiveOrders, updateOrderStatus } = useOrders();
  const { tables, updateTableStatus } = useTables();
  const { user } = useAuth();
  const { isSessionOpen } = useCashSession();

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [viewMode, setViewMode] = useState<'tables' | 'products'>('tables');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashClosureModal, setShowCashClosureModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const printService = PrintService.getInstance();
  const activeOrders = getActiveOrders();
  const activeProducts = getActiveProducts();
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

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
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handleProductClick = (product: any) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
    } else {
      addToCart(product);
    }
  };

  const handleSizeSelect = (size: string) => {
    if (selectedProduct) {
      addToCart(selectedProduct, size);
      setSelectedProduct(null);
    }
  };

  const handleTableClick = (table: any, order?: Order) => {
    if (order) {
      setSelectedOrderForPayment(order);
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

  const handleSendToPrinter = async () => {
    if (cart.length === 0 || !selectedTableId) {
      alert('Veuillez sélectionner une table et ajouter des articles');
      return;
    }

    try {
      const order: Order = {
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

      addOrder(order);
      updateTableStatus(selectedTableId, 'occupied');

      const itemsByPrinter: { [key: string]: any[] } = {};
      cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = categories.find(c => c.name === item.category);
        const printerType = item.printer || product?.printer || category?.printer || 'cuisine';

        if (!itemsByPrinter[printerType]) {
          itemsByPrinter[printerType] = [];
        }
        itemsByPrinter[printerType].push(item);
      });

      console.log('Envoi vers les imprimantes:', Object.keys(itemsByPrinter));

      for (const [printerType, items] of Object.entries(itemsByPrinter)) {
        console.log(`Envoi de ${items.length} article(s) vers ${printerType}...`);
        await printService.printOrderByPrinter(items, printerType, 'dine-in', selectedTableId);
      }

      alert('Commande envoyée !\nImpression(s) envoyée(s) à la cuisine/bar.');
      clearCart();
      setViewMode('tables');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi:\n' + errorMsg + '\n\nVérifiez les imprimantes dans Paramètres.\nConsultez la console (F12) pour plus de détails.');
    }
  };

  const handleProcessPayment = async () => {
    if (selectedOrderForPayment) {
      try {
        console.log('Impression du ticket pour commande existante...');
        await printService.printTicket(selectedOrderForPayment);
        console.log('Ticket imprimé avec succès');

        updateOrderStatus(selectedOrderForPayment.id, 'paid');
        if (selectedOrderForPayment.tableId) {
          updateTableStatus(selectedOrderForPayment.tableId, 'available');
        }
        alert(`Paiement de ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA encaissé !\nTicket envoyé à l'impression.`);
        clearCart();
        setViewMode('tables');
      } catch (error) {
        console.error('Erreur d\'impression:', error);
        alert('Paiement encaissé mais erreur d\'impression.\nVérifiez l\'imprimante de caisse.');
      }
      return;
    }

    if (cart.length === 0) return;

    try {
      const order: Order = {
        id: Date.now().toString(),
        orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
        type: 'dine-in',
        status: 'paid',
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

      addOrder(order);
      if (selectedTableId) {
        updateTableStatus(selectedTableId, 'available');
      }

      console.log('Impression du ticket de caisse...');
      await printService.printTicket(order);
      console.log('Ticket imprimé avec succès');

      alert(`Paiement de ${total.toLocaleString('fr-FR')} CFA encaissé !\nTicket envoyé à l'impression.`);
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Paiement encaissé mais erreur d\'impression.\nVérifiez l\'imprimante de caisse.');
    }
  };

  if (!isSessionOpen) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-10 w-10 text-blue-700" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Session de caisse fermée</h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">Veuillez ouvrir une session de caisse dans les paramètres pour commencer</p>
        </div>
      </div>
    );
  }

  const tablesWithOrders = tables.map(table => {
    const order = activeOrders.find(o => o.tableId === table.id);
    return { ...table, order };
  });

  const filteredTables = tablesWithOrders.filter(t => t.section === selectedSection);
  const displayedProducts = selectedCategory
    ? activeProducts.filter(p => p.category === selectedCategory)
    : activeProducts;
  const displayItems = selectedOrderForPayment ? selectedOrderForPayment.items : cart;
  const displayTotal = selectedOrderForPayment ? selectedOrderForPayment.total : total;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Point de vente</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Utilisateur: <span className="font-medium text-slate-800">{user?.name || 'Admin'}</span></p>
        </div>

        {viewMode === 'tables' ? (
          <div className="space-y-5 md:space-y-6">
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
              {sections.map(section => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`flex-1 min-w-[80px] py-4 md:py-5 px-6 md:px-8 rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 touch-manipulation ${
                    selectedSection === section
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md border-2 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  Section {section}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table, table.order)}
                  className={`group p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 touch-manipulation transform hover:scale-105 ${
                    table.status === 'occupied'
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-300 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-200/50'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        table.status === 'occupied' ? 'bg-orange-200' : 'bg-slate-100 group-hover:bg-blue-100'
                      }`}>
                        <Users className={`h-5 w-5 ${table.status === 'occupied' ? 'text-orange-700' : 'text-slate-500 group-hover:text-blue-600'}`} />
                      </div>
                      <span className="font-bold text-xl md:text-2xl text-slate-900">Table {table.number}</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      table.status === 'occupied'
                        ? 'bg-orange-200 text-orange-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {table.status === 'occupied' ? 'Occupée' : 'Libre'}
                    </span>
                  </div>

                  {table.order && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 font-medium">{table.order.items.length} article{table.order.items.length > 1 ? 's' : ''}</span>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-mono text-xs">{formatTime(new Date(table.order.createdAt))}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                          {table.order.total.toLocaleString('fr-FR')} <span className="text-base text-slate-600">CFA</span>
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-5 md:px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 touch-manipulation ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                Tous les produits
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-5 md:px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 touch-manipulation ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {displayedProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group bg-white border-2 border-slate-200 rounded-2xl p-4 md:p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 text-left touch-manipulation transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex-shrink-0 ml-2 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="space-y-1.5 text-xs md:text-sm text-slate-600">
                      {product.sizes.map((size: any) => (
                        <div key={size.name} className="flex justify-between items-center py-1">
                          <span className="font-medium">{size.name}</span>
                          <span className="font-bold text-slate-900">{size.price.toLocaleString('fr-FR')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        {product.price.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">CFA</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === 'products' && (
        <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] bg-white border-l border-slate-200 flex flex-col h-screen shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 md:px-6 py-5 md:py-6 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {selectedTableId ? `Table ${tables.find(t => t.id === selectedTableId)?.number}` : 'Nouvelle Commande'}
                </h2>
                <p className="text-xs md:text-sm text-blue-100 font-medium">{displayItems.length} article{displayItems.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { clearCart(); setViewMode('tables'); }}
              className="text-white hover:bg-white/20 p-2 md:p-2.5 rounded-xl transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-slate-50 px-5 md:px-6 py-3 border-b border-slate-200 hidden md:flex items-center gap-4 font-bold text-xs text-slate-600 uppercase tracking-wide">
            <div className="flex-1">Article</div>
            <div className="w-28 text-center">Quantité</div>
            <div className="w-32 text-right">Total</div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {displayItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {displayItems.map(item => (
                  <div key={item.id} className="px-5 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base md:text-lg text-slate-900 truncate">{item.productName}</p>
                      {item.size && <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">{item.size}</p>}
                      <p className="text-sm md:text-base text-slate-600 mt-1 font-semibold">{item.price.toLocaleString('fr-FR')} <span className="text-xs text-slate-500">CFA</span></p>
                    </div>

                    {!selectedOrderForPayment && (
                      <div className="w-28 flex-shrink-0">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center touch-manipulation font-bold"
                          >
                            <Minus className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                          <span className="font-bold text-lg md:text-xl text-slate-900 w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 text-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center touch-manipulation font-bold"
                          >
                            <Plus className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedOrderForPayment && (
                      <div className="w-28 text-center font-bold text-lg text-slate-700">{item.quantity}</div>
                    )}

                    <div className="w-24 md:w-32 text-right flex-shrink-0">
                      <p className="font-bold text-lg md:text-xl text-slate-900 tracking-tight">
                        {(item.price * item.quantity).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">CFA</p>
                    </div>

                    {!selectedOrderForPayment && (
                      <div className="w-10 flex justify-end flex-shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 touch-manipulation"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-3xl flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-500">Panier vide</p>
                  <p className="text-sm text-slate-400 mt-2">Ajoutez des articles pour commencer</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white shadow-2xl">
            <div className="px-5 md:px-6 py-5 md:py-6 bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Total à payer</span>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-mono font-bold">{formatTime(currentTime)}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                  {displayTotal.toLocaleString('fr-FR')}
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-600">CFA</div>
              </div>
            </div>

            <div className="px-5 md:px-6 py-4 md:py-5 space-y-3 bg-white">
              {!selectedOrderForPayment && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { clearCart(); setViewMode('tables'); }}
                    disabled={cart.length === 0}
                    className="px-4 md:px-5 py-4 md:py-5 bg-slate-100 hover:bg-red-50 border-2 border-slate-300 hover:border-red-400 text-slate-700 hover:text-red-700 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm md:text-base touch-manipulation"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Annuler</span>
                  </button>
                  <button
                    onClick={handleSendToPrinter}
                    disabled={cart.length === 0}
                    className="px-4 md:px-5 py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 font-bold text-sm md:text-base touch-manipulation"
                  >
                    <Printer className="h-5 w-5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleProcessPayment}
                disabled={displayItems.length === 0}
                className="w-full px-6 py-5 md:py-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-emerald-500/40 font-black text-lg md:text-xl touch-manipulation transform hover:scale-105 active:scale-95"
              >
                <CreditCard className="h-7 w-7" />
                <span>ENCAISSER MAINTENANT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          title={`Choisir la taille - ${selectedProduct.name}`}
        >
          <div className="space-y-3 md:space-y-4">
            {selectedProduct.sizes.map((size: any) => (
              <button
                key={size.name}
                onClick={() => handleSizeSelect(size.name)}
                className="w-full p-5 md:p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center justify-between group touch-manipulation transform hover:scale-105"
              >
                <span className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{size.name}</span>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {size.price.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">CFA</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showBillPreview && (
        <BillPreview
          order={{
            id: Date.now().toString(),
            orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
            type: 'dine-in',
            status: 'pending',
            tableId: selectedTableId,
            waiterId: user?.id,
            items: [...cart],
            subtotal,
            tax,
            total,
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
            notes,
          }}
          onClose={() => setShowBillPreview(false)}
        />
      )}

      {showTicketPreview && (
        <TicketPreview
          order={{
            id: Date.now().toString(),
            orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
            type: 'dine-in',
            status: 'pending',
            tableId: selectedTableId,
            waiterId: user?.id,
            items: [...cart],
            subtotal,
            tax,
            total,
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
            notes,
          }}
          onClose={() => setShowTicketPreview(false)}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal onClose={() => setShowExpenseModal(false)} />
      )}

      {showCashClosureModal && (
        <CashClosureModal onClose={() => setShowCashClosureModal(false)} />
      )}
    </div>
  );
};

export default POSSystem;
