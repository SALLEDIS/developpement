import React, { useState } from 'react';
import { ShoppingCart, Search, Grid3x3, List, User, CreditCard, Banknote, Receipt, X, Plus, Minus, Trash2, Clock, Check, DollarSign, LogIn } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import { useCashSession } from '../../hooks/useCashSession';
import { OrderItem, Order } from '../../types';
import PrintService from '../../services/PrintService';

const ModernPOS: React.FC = () => {
  const { products, categories, getActiveProducts } = useProducts();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const { isSessionOpen, openSession, currentSession } = useCashSession();

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [startingCash, setStartingCash] = useState('');

  const printService = PrintService.getInstance();
  const activeProducts = getActiveProducts();
  const categoryOptions = ['all', ...categories.filter(c => c.isActive).map(c => c.name)];

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        category: product.category,
        printer: product.printer,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setReceivedAmount('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handlePayment = async () => {
    if (cart.length === 0) return;

    const order: Order = {
      id: Date.now().toString(),
      orderNumber: `CMD${Date.now().toString().slice(-6)}`,
      items: cart,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status: 'completed',
      paymentMethod,
      customerId: customerName || undefined,
      userId: user?.id || '',
      createdAt: new Date(),
      type: 'takeaway',
    };

    try {
      addOrder(order);
      await printService.printTicket(order, cart);
      alert('Commande enregistrée et ticket imprimé!');
      clearCart();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du traitement de la commande');
    }
  };

  const getChange = () => {
    const received = parseFloat(receivedAmount) || 0;
    const total = calculateTotal();
    return received - total;
  };

  const handleOpenSession = () => {
    const amount = parseFloat(startingCash);
    if (amount && amount >= 0) {
      openSession(amount);
      setShowOpenSessionModal(false);
      setStartingCash('');
    }
  };

  if (!isSessionOpen) {
    return (
      <>
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Session de caisse fermée</h3>
              <p className="text-gray-600 mb-8">Ouvrez une session pour commencer à vendre</p>
              <button
                onClick={() => setShowOpenSessionModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                Ouvrir une session de caisse
              </button>
              {currentSession && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Dernière session: {user?.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal d'ouverture de session */}
        {showOpenSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Ouvrir la caisse</h3>
                  <button
                    onClick={() => setShowOpenSessionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caissier
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{user?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fond de caisse initial
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      placeholder="0"
                      autoFocus
                      className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-right"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      CFA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Entrez le montant en espèces présent dans la caisse
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Important:</strong> Ce montant servira de référence pour la clôture de caisse en fin de journée.
                  </p>
                </div>

                <button
                  onClick={handleOpenSession}
                  disabled={!startingCash || parseFloat(startingCash) < 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  Ouvrir la session
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Section produits */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barre de recherche et filtres */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categoryOptions.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de produits */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-500 text-left"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-4xl">{product.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2 truncate">{product.category}</p>
                  <p className="text-lg font-bold text-blue-600">{product.price.toLocaleString()} CFA</p>
                  {product.stock !== undefined && product.stock <= 5 && (
                    <p className="text-xs text-amber-600 mt-1">Stock: {product.stock}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-500 flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">{product.price.toLocaleString()} CFA</p>
                    {product.stock !== undefined && product.stock <= 5 && (
                      <p className="text-xs text-amber-600">Stock: {product.stock}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panier */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* En-tête du panier */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Panier
            </h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Vider le panier
            </button>
          )}
        </div>

        {/* Articles du panier */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="h-16 w-16 mb-3" />
              <p className="text-center">Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">{item.price.toLocaleString()} CFA</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} CFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totaux et paiement */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{calculateSubtotal().toLocaleString()} CFA</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA (18%)</span>
                <span>{calculateTax().toLocaleString()} CFA</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{calculateTotal().toLocaleString()} CFA</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              Procéder au paiement
            </button>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Paiement</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Montant total */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateTotal().toLocaleString()} CFA
                </p>
              </div>

              {/* Nom du client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du client (optionnel)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Entrez le nom"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="h-6 w-6" />
                    <span className="text-xs font-medium">Espèces</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs font-medium">Carte</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('digital')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                      paymentMethod === 'digital'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Receipt className="h-6 w-6" />
                    <span className="text-xs font-medium">Mobile</span>
                  </button>
                </div>
              </div>

              {/* Montant reçu et monnaie (espèces uniquement) */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant reçu
                    </label>
                    <input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-lg font-semibold"
                    />
                  </div>
                  {receivedAmount && parseFloat(receivedAmount) >= calculateTotal() && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Monnaie à rendre</p>
                      <p className="text-2xl font-bold text-green-600">
                        {getChange().toLocaleString()} CFA
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bouton de confirmation */}
              <button
                onClick={handlePayment}
                disabled={paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < calculateTotal())}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernPOS;
