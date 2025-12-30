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

      for (const [printerType, items] of Object.entries(itemsByPrinter)) {
        await printService.printOrderByPrinter(items, printerType, 'dine-in', selectedTableId);
      }

      alert('Commande envoyée !');
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi');
    }
  };

  const handleProcessPayment = async () => {
    if (selectedOrderForPayment) {
      updateOrderStatus(selectedOrderForPayment.id, 'paid');
      if (selectedOrderForPayment.tableId) {
        updateTableStatus(selectedOrderForPayment.tableId, 'available');
      }
      alert(`Paiement de ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA encaissé !`);
      clearCart();
      setViewMode('tables');
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

      alert(`Paiement de ${total.toLocaleString('fr-FR')} CFA encaissé !`);
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!isSessionOpen) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session de caisse fermée</h2>
          <p className="text-gray-600">Veuillez ouvrir une session de caisse dans les paramètres</p>
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
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Point de vente</h1>
          <p className="text-gray-600">Utilisateur: {user?.name || 'Admin'}</p>
        </div>

        {viewMode === 'tables' ? (
          <div className="space-y-6">
            <div className="flex gap-3">
              {sections.map(section => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    selectedSection === section
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {filteredTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table, table.order)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    table.status === 'occupied'
                      ? 'bg-orange-50 border-orange-300 hover:border-orange-400'
                      : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className={`h-5 w-5 ${table.status === 'occupied' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className="font-bold text-xl">Table {table.number}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      table.status === 'occupied'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {table.status === 'occupied' ? 'Occupée' : 'Libre'}
                    </span>
                  </div>

                  {table.order && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{table.order.items.length} article(s)</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(new Date(table.order.createdAt))}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {table.order.total.toLocaleString('fr-FR')} CFA
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {displayedProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    {product.sizes && product.sizes.length > 0 && (
                      <Tag className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      {product.sizes.map((size: any) => (
                        <div key={size.name} className="flex justify-between">
                          <span>{size.name}</span>
                          <span className="font-semibold">{size.price.toLocaleString('fr-FR')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString('fr-FR')}
                      <span className="text-sm font-normal text-gray-500 ml-1">CFA</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === 'products' && (
        <div className="w-[700px] bg-white border-l-2 border-gray-200 flex flex-col h-screen">
          <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedTableId ? `Table ${tables.find(t => t.id === selectedTableId)?.number}` : 'Commande'}
                </h2>
                <p className="text-sm text-blue-100">{displayItems.length} article{displayItems.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { clearCart(); setViewMode('tables'); }}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200 flex items-center gap-4 font-semibold text-sm text-gray-600 uppercase">
            <div className="flex-1">Article</div>
            <div className="w-28 text-center">Quantité</div>
            <div className="w-32 text-right">Prix Total</div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {displayItems.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {displayItems.map(item => (
                  <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-semibold text-base text-gray-900">{item.productName}</p>
                      {item.size && <p className="text-sm text-gray-500 mt-0.5">{item.size}</p>}
                      <p className="text-sm text-gray-600 mt-1">{item.price.toLocaleString('fr-FR')} CFA</p>
                    </div>

                    {!selectedOrderForPayment && (
                      <div className="w-28">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-base text-gray-900 w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-green-100 hover:text-green-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedOrderForPayment && (
                      <div className="w-28 text-center font-bold text-base text-gray-700">{item.quantity}</div>
                    )}

                    <div className="w-32 text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {(item.price * item.quantity).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">CFA</p>
                    </div>

                    {!selectedOrderForPayment && (
                      <div className="w-10 flex justify-end">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="h-20 w-20 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">Aucun article</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t-2 border-gray-200 bg-white">
            <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-blue-100 border-b-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 uppercase">Total à payer</span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-mono font-semibold">{formatTime(currentTime)}</span>
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900">
                {displayTotal.toLocaleString('fr-FR')}
              </div>
              <div className="text-lg font-semibold text-gray-600 mt-1">CFA</div>
            </div>

            <div className="px-6 py-4 space-y-3">
              {!selectedOrderForPayment && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { clearCart(); setViewMode('tables'); }}
                    disabled={cart.length === 0}
                    className="px-5 py-4 bg-gray-100 hover:bg-red-50 border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-700 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 font-semibold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Annuler</span>
                  </button>
                  <button
                    onClick={handleSendToPrinter}
                    disabled={cart.length === 0}
                    className="px-5 py-4 bg-orange-500 hover:bg-orange-600 border-2 border-orange-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-md font-semibold"
                  >
                    <Printer className="h-5 w-5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleProcessPayment}
                disabled={displayItems.length === 0}
                className="w-full px-6 py-5 bg-green-600 hover:bg-green-700 border-2 border-green-700 text-white rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-lg font-bold text-lg"
              >
                <CreditCard className="h-6 w-6" />
                <span>ENCAISSER</span>
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
          <div className="space-y-3">
            {selectedProduct.sizes.map((size: any) => (
              <button
                key={size.name}
                onClick={() => handleSizeSelect(size.name)}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between"
              >
                <span className="text-lg font-semibold text-gray-900">{size.name}</span>
                <span className="text-xl font-bold text-gray-900">
                  {size.price.toLocaleString('fr-FR')} CFA
                </span>
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
