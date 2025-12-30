import React, { useState, useEffect } from 'react';
import BillPreview from './BillPreview';
import TicketPreview from './TicketPreview';
import ExpenseModal from './ExpenseModal';
import CashClosureModal from './CashClosureModal';
import TableSelector from './TableSelector';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import PrintService from '../../services/PrintService';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';
import { useAuth } from '../../hooks/useAuth';
import { useCashSession } from '../../hooks/useCashSession';
import { useCart } from '../../hooks/useCart';
import { Order, Customer } from '../../types';

const POSSystem: React.FC = () => {
  const { products, categories, getActiveProducts } = useProducts();
  const { addOrder, getActiveOrders, updateOrderStatus } = useOrders();
  const { tables, updateTableStatus } = useTables();
  const { user } = useAuth();
  const { isSessionOpen } = useCashSession();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartOnly,
    total,
    subtotal,
    tax,
  } = useCart();

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

  const printService = PrintService.getInstance();
  const activeOrders = getActiveOrders();
  const activeProducts = getActiveProducts();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clearCart = () => {
    clearCartOnly();
    setSelectedCustomer(null);
    setNotes('');
    setSelectedTableId('');
    setSelectedOrderForPayment(null);
  };

  const createOrder = (): Order => {
    const orderTotal = selectedOrderForPayment?.total || total;
    return {
      id: Date.now().toString(),
      orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
      type: 'dine-in',
      status: 'pending',
      tableId: selectedTableId,
      customerId: selectedCustomer?.id,
      waiterId: user?.id,
      items: selectedOrderForPayment ? selectedOrderForPayment.items : [...cart],
      subtotal: selectedOrderForPayment?.subtotal || subtotal,
      tax: selectedOrderForPayment?.tax || tax,
      total: orderTotal,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
    };
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedOrderForPayment(null);
    setViewMode('products');
    if (categories.length > 0) {
      setSelectedCategory(categories[0].name);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrderForPayment(order);
    setSelectedTableId(order.tableId || '');
    clearCartOnly();
    setViewMode('products');
  };

  const handleCloseCart = () => {
    clearCart();
    setViewMode('tables');
  };

  const handleSendToPrinter = async () => {
    if (cart.length === 0 || !selectedTableId) {
      alert('Veuillez sélectionner une table et ajouter des articles');
      return;
    }

    try {
      const order = createOrder();
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

      alert('Commande envoyée aux imprimantes avec succès !');
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi aux imprimantes');
    }
  };

  const handlePrintBill = async () => {
    const items = selectedOrderForPayment ? selectedOrderForPayment.items : cart;
    if (items.length === 0) return;

    try {
      const order = createOrder();
      await printService.printBill(order, items, selectedCustomer?.name);
      alert('Addition imprimée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'impression de l\'addition');
    }
  };

  const handleOpenCashDrawer = () => {
    alert('Ouverture du tiroir-caisse...');
  };

  const handleProcessPayment = async () => {
    if (selectedOrderForPayment) {
      updateOrderStatus(selectedOrderForPayment.id, 'paid');
      if (selectedOrderForPayment.tableId) {
        updateTableStatus(selectedOrderForPayment.tableId, 'available');
      }
      alert(`Paiement de ${selectedOrderForPayment.total.toLocaleString('fr-FR')} CFA traité !`);
      clearCart();
      setViewMode('tables');
      return;
    }

    if (cart.length === 0) return;

    try {
      const order = createOrder();
      addOrder(order);

      if (selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }

      await printService.printTicket(order, [...cart]);

      const itemCategories = [...new Set(cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category || 'Plats';
      }))];

      await printService.printOrder([...cart], itemCategories, 'dine-in', selectedTableId);

      alert(`Paiement de ${total.toLocaleString('fr-FR')} CFA traité avec succès !`);
      clearCart();
      setViewMode('tables');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du traitement');
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

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Point de vente</h1>
          <p className="text-gray-600">Utilisateur: {user?.name || 'Admin'}</p>
        </div>

        {viewMode === 'tables' ? (
          <TableSelector
            tables={tables}
            activeOrders={activeOrders}
            selectedSection={selectedSection}
            onSectionChange={setSelectedSection}
            onTableSelect={handleTableSelect}
            onOrderSelect={handleOrderSelect}
          />
        ) : (
          <ProductGrid
            products={activeProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onProductSelect={addToCart}
          />
        )}
      </div>

      {viewMode === 'products' && (
        <CartPanel
          cart={cart}
          selectedOrder={selectedOrderForPayment}
          selectedTableNumber={tables.find(t => t.id === selectedTableId)?.number}
          total={selectedOrderForPayment?.total || total}
          subtotal={selectedOrderForPayment?.subtotal || subtotal}
          tax={selectedOrderForPayment?.tax || tax}
          currentTime={currentTime}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onSendToPrinter={handleSendToPrinter}
          onPrintBill={handlePrintBill}
          onOpenCashDrawer={handleOpenCashDrawer}
          onProcessPayment={handleProcessPayment}
          onClose={handleCloseCart}
        />
      )}

      {showBillPreview && (
        <BillPreview
          order={createOrder()}
          onClose={() => setShowBillPreview(false)}
        />
      )}

      {showTicketPreview && (
        <TicketPreview
          order={createOrder()}
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
