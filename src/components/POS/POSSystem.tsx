import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Printer, Receipt, DollarSign, Clock, X, Users, Tag, ChevronUp, ChevronDown, Check, Search, User, LayoutGrid, Pause, RotateCcw } from 'lucide-react';
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
      <div className="flex items-center justify-center h-screen bg-[#1e293b]">
        <div className="bg-[#334155] p-10 md:p-12 rounded-lg text-center max-w-md mx-4 border border-[#475569]">
          <div className="w-20 h-20 bg-[#0891b2] rounded-lg flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Session de caisse fermee</h2>
          <p className="text-gray-300 text-base md:text-lg">Veuillez ouvrir une session de caisse dans les parametres pour commencer</p>
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
    <div className="flex h-screen bg-[#1a2332]">
      {viewMode === 'tables' && (
        <div className="w-20 bg-[#1a2332] border-r border-[#2d3748] flex flex-col items-center py-4 gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`w-14 h-14 rounded-lg font-bold text-sm transition-all touch-manipulation ${
                selectedSection === section
                  ? 'bg-[#0891b2] text-white'
                  : 'bg-[#2d3748] text-gray-400 hover:bg-[#374151] hover:text-white'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'products' && (
        <div className="w-32 bg-[#1a2332] border-r border-[#2d3748] flex flex-col">
          <button
            onClick={() => { clearCart(); setViewMode('tables'); }}
            className="h-14 bg-[#0891b2] text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-[#0e7490] transition-colors touch-manipulation"
          >
            <Users className="h-4 w-4" />
            Tables
          </button>
          <div className="flex-1 overflow-y-auto py-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full py-4 px-2 text-xs font-bold text-center transition-all touch-manipulation ${
                selectedCategory === ''
                  ? 'bg-[#0891b2] text-white'
                  : 'bg-[#2d3748] text-gray-300 hover:bg-[#374151]'
              }`}
            >
              TOUS
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full py-4 px-2 text-xs font-bold text-center transition-all touch-manipulation ${
                  selectedCategory === category.name
                    ? 'bg-[#0891b2] text-white'
                    : 'bg-[#2d3748] text-gray-300 hover:bg-[#374151]'
                }`}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-[#1a2332] border-b border-[#2d3748] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <LayoutGrid className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400 text-sm">{user?.name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'tables' ? 'products' : 'tables')}
              className="px-4 py-1.5 bg-[#0891b2] text-white text-xs font-bold rounded hover:bg-[#0e7490] transition-colors touch-manipulation flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Tables
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 bg-[#1a2332]">
          {viewMode === 'tables' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filteredTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table, table.order)}
                  className={`relative h-24 rounded-lg transition-all touch-manipulation flex flex-col items-center justify-center ${
                    table.status === 'occupied'
                      ? 'bg-[#f97316] hover:bg-[#ea580c]'
                      : 'bg-[#0891b2] hover:bg-[#0e7490]'
                  }`}
                >
                  <span className="text-white font-bold text-lg">Table {table.number}</span>
                  {table.order && (
                    <span className="text-white/90 text-sm font-semibold mt-1">
                      {table.order.total.toLocaleString('fr-FR')} F
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    table.status === 'occupied' ? 'bg-white/50' : 'bg-white/30'
                  }`} />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
              {displayedProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-[#22d3ee] hover:bg-[#06b6d4] h-20 md:h-24 rounded transition-all touch-manipulation flex flex-col justify-between p-2 text-left relative group"
                >
                  <span className="text-[#0e4d5c] font-bold text-xs md:text-sm leading-tight line-clamp-2 uppercase">
                    {product.name}
                  </span>
                  <span className="text-[#0e4d5c] font-bold text-sm md:text-base self-end">
                    {product.sizes && product.sizes.length > 0
                      ? product.sizes[0].price.toLocaleString('fr-FR')
                      : product.price.toLocaleString('fr-FR')}
                  </span>
                  {product.sizes && product.sizes.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#0e4d5c] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'products' && (
        <div className="w-80 lg:w-96 bg-[#374151] flex flex-col h-screen border-l border-[#4b5563]">
          <div className="px-4 py-3 border-b border-[#4b5563] flex items-center justify-between">
            <h2 className="text-[#ef4444] font-bold text-lg">
              {selectedTableId ? `Table ${tables.find(t => t.id === selectedTableId)?.number}` : 'Vente directe'}
            </h2>
            <button
              onClick={() => { clearCart(); setViewMode('tables'); }}
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-[#2d3748] px-3 py-2 flex items-center text-xs font-bold text-gray-400 border-b border-[#4b5563]">
            <div className="flex-1">Article</div>
            <div className="w-12 text-center">Qte</div>
            <div className="w-20 text-right">Px Total</div>
          </div>

          <div className="flex-1 overflow-auto bg-[#2d3748]">
            {displayItems.length > 0 ? (
              <div className="divide-y divide-[#374151]">
                {displayItems.map(item => (
                  <div key={item.id} className="px-3 py-2 flex items-center gap-2 hover:bg-[#374151] transition-colors text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.productName}</p>
                      {item.size && <p className="text-gray-400 text-xs">{item.size}</p>}
                    </div>
                    <div className="w-12 text-center text-white font-bold">{item.quantity}</div>
                    <div className="w-20 text-right text-white font-bold">
                      {(item.price * item.quantity).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                Aucun article
              </div>
            )}
          </div>

          <div className="border-t border-[#4b5563] bg-[#374151]">
            <div className="px-3 py-2 flex items-center justify-center gap-2">
              <ChevronUp className="h-4 w-4 text-gray-400" />
              <ChevronDown className="h-4 w-4 text-gray-400" />
              <Check className="h-4 w-4 text-gray-400 ml-4" />
            </div>

            {!selectedOrderForPayment && (
              <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                <button className="bg-[#4b5563] hover:bg-[#6b7280] p-2 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Quantite</span>
                </button>
                <button
                  onClick={() => cart.length > 0 && clearCart()}
                  className="bg-[#4b5563] hover:bg-[#ef4444] p-2 rounded flex flex-col items-center justify-center text-[#ef4444] hover:text-white transition-colors touch-manipulation"
                >
                  <X className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Supprimer</span>
                </button>
                <button className="bg-[#4b5563] hover:bg-[#6b7280] p-2 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                  <Tag className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Remise</span>
                </button>
                <button className="bg-[#4b5563] hover:bg-[#6b7280] p-2 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                  <Receipt className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Remarque</span>
                </button>
                <button className="bg-[#4b5563] hover:bg-[#6b7280] p-2 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Peser</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#2d3748] border-t border-[#4b5563] px-3 py-3">
            <div className="text-3xl font-mono text-gray-300 text-center mb-3">
              {formatTime(currentTime)}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button className="bg-[#4b5563] hover:bg-[#6b7280] p-3 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Client</span>
              </button>
              <button className="bg-[#4b5563] hover:bg-[#6b7280] p-3 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                <Minus className="h-6 w-6" />
                <span className="text-xs mt-1">Separateur</span>
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={displayItems.length === 0}
                className="bg-[#ef4444] hover:bg-[#dc2626] p-3 rounded flex flex-col items-center justify-center text-white transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt className="h-6 w-6" />
                <span className="text-xs mt-1">Ticket</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex items-center bg-[#1a2332] rounded border border-[#4b5563]">
                <span className="px-2 text-gray-400 text-xs">Code article</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-white px-2 py-2 text-sm outline-none"
                  placeholder=""
                />
                <Search className="h-4 w-4 text-gray-400 mr-2" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl font-bold text-white">
                {displayTotal.toLocaleString('fr-FR')} <span className="text-2xl">CFA</span>
              </div>
              <span className="text-gray-400 text-lg">{displayItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleSendToPrinter}
                disabled={cart.length === 0 || selectedOrderForPayment !== null}
                className="bg-[#1f2937] hover:bg-[#374151] p-3 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed col-span-1"
              >
                <Printer className="h-6 w-6" />
                <span className="text-xs mt-1">Sur place</span>
              </button>
              <button className="bg-[#4b5563] hover:bg-[#6b7280] p-3 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                <DollarSign className="h-6 w-6" />
                <span className="text-xs mt-1">Tiroir</span>
              </button>
              <button className="bg-[#0891b2] hover:bg-[#0e7490] p-3 rounded flex flex-col items-center justify-center text-white transition-colors touch-manipulation">
                <Pause className="h-6 w-6" />
                <span className="text-xs mt-1">Attente</span>
              </button>
              <button className="bg-[#4b5563] hover:bg-[#6b7280] p-3 rounded flex flex-col items-center justify-center text-gray-300 transition-colors touch-manipulation">
                <RotateCcw className="h-6 w-6" />
                <span className="text-xs mt-1">Rap. ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#374151] rounded-lg w-full max-w-md border border-[#4b5563]">
            <div className="px-4 py-3 border-b border-[#4b5563] flex items-center justify-between">
              <h3 className="text-white font-bold">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {selectedProduct.sizes.map((size: any) => (
                <button
                  key={size.name}
                  onClick={() => handleSizeSelect(size.name)}
                  className="w-full p-4 bg-[#22d3ee] hover:bg-[#06b6d4] rounded-lg transition-all flex items-center justify-between touch-manipulation"
                >
                  <span className="text-[#0e4d5c] font-bold text-lg">{size.name}</span>
                  <span className="text-[#0e4d5c] font-bold text-xl">
                    {size.price.toLocaleString('fr-FR')} CFA
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
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
