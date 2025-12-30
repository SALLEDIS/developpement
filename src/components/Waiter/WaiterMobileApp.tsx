import React, { useState } from 'react';
import { ShoppingBag, Send, X, Plus, Minus, Check } from 'lucide-react';
import { Product, CartItem, Table } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';

const WaiterMobileApp: React.FC = () => {
  const { products, categories } = useProducts();
  const { tables } = useTables();
  const { addOrder } = useOrders();
  const { user } = useAuth();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableProducts = products.filter(p => p.isAvailable);
  const filteredProducts = selectedCategory === 'all'
    ? availableProducts
    : availableProducts.filter(p => p.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleSendOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    addOrder({
      tableNumber: selectedTable.number,
      items: cart,
      status: 'pending',
      waiter: user?.username || 'Serveur',
      total: cartTotal,
    });

    setCart([]);
    setShowCart(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleClearCart = () => {
    if (confirm('Vider le panier ?')) {
      setCart([]);
    }
  };

  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mode Serveur</h1>
            <p className="text-gray-600">Sélectionnez une table pour commencer</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                disabled={table.status === 'occupied'}
                className={`p-6 rounded-lg shadow-lg transition-all ${
                  table.status === 'occupied'
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-white text-gray-900 hover:bg-blue-50 active:scale-95'
                }`}
              >
                <div className="text-3xl font-bold mb-1">T{table.number}</div>
                <div className="text-xs">
                  {table.status === 'occupied' ? 'Occupée' : 'Disponible'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-lg p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (cart.length > 0 && !confirm('Quitter sans envoyer ?')) return;
                setSelectedTable(null);
                setCart([]);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Table {selectedTable.number}</h2>
              <p className="text-sm text-gray-600">{user?.username || 'Serveur'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-blue-600 text-white rounded-lg active:scale-95 transition-transform"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tout
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-lg shadow-lg p-4 active:scale-95 transition-transform"
            >
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xl font-bold text-blue-600">{product.price.toFixed(2)} €</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">Panier</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Table {selectedTable.number}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Panier vide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.productId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.price.toFixed(2)} €</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-lg active:scale-95"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="text-xl font-bold text-gray-900 w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-lg active:scale-95"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <div className="ml-auto text-lg font-bold text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {cartTotal.toFixed(2)} €
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearCart}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold active:scale-95 transition-transform"
                  >
                    Vider
                  </button>
                  <button
                    onClick={handleSendOrder}
                    className="flex-1 py-4 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Send className="h-5 w-5" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Commande envoyée !</h3>
            <p className="text-gray-600">La cuisine/bar a reçu la commande</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterMobileApp;
