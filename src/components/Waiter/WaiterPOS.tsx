import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, Send, Users, Edit, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';
import { useAuth } from '../../hooks/useAuth';
import { OrderItem, Order } from '../../types';
import { PrintService } from '../../services/PrintService';

interface WaiterPOSProps {
  selectedTable: any;
  isAddingToExisting?: boolean;
  existingOrder?: Order | null;
  onBack: () => void;
}

const WaiterPOS: React.FC<WaiterPOSProps> = ({ 
  selectedTable, 
  isAddingToExisting = false,
  existingOrder = null,
  onBack 
}) => {
  const { products, categories, getActiveProducts } = useProducts();
  const { addOrder, updateOrder } = useOrders();
  const { updateTableStatus } = useTables();
  const { user } = useAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');

  const activeProducts = getActiveProducts();
  const categoryOptions = ['all', ...categories.filter(c => c.isActive).map(c => c.name)];

  // Charger les articles existants si on ajoute à une commande
  useEffect(() => {
    if (isAddingToExisting && existingOrder) {
      setNotes(existingOrder.notes || '');
    }
  }, [isAddingToExisting, existingOrder]);

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const sendOrder = async () => {
    if (cart.length === 0) return;

    try {
      const printService = PrintService.getInstance();

      if (isAddingToExisting && existingOrder) {
        // Ajouter à la commande existante
        const updatedItems = [...existingOrder.items, ...cart];
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTax = newSubtotal * 0.1;
        const newTotal = newSubtotal + newTax;

        const updatedOrder: Partial<Order> = {
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          updatedAt: new Date(),
          notes: notes || existingOrder.notes,
        };

        updateOrder(existingOrder.id, updatedOrder);

        // Imprimer les nouveaux articles vers les imprimantes appropriées
        try {
          await printService.printOrder(
            cart,
            categories.map(c => c.name),
            existingOrder.type,
            existingOrder.tableId
          );
        } catch (printError) {
          console.error('Erreur impression:', printError);
          // Continuer même si l'impression échoue
        }

        alert(
          `Articles ajoutés avec succès !\n\n` +
          `Commande: ${existingOrder.orderNumber}\n` +
          `Nouveaux articles: ${cart.length}\n` +
          `Nouveau total: ${newTotal.toLocaleString('fr-FR')} CFA`
        );
      } else {
        // Créer une nouvelle commande
        const order: Omit<Order, 'id'> = {
          orderNumber: `CMD-${Date.now().toString().slice(-6)}`,
          type: selectedTable ? 'dine-in' : orderType,
          status: 'pending',
          tableId: selectedTable?.id,
          waiterId: user?.id,
          items: [...cart],
          subtotal,
          tax,
          total,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes,
        };

        addOrder(order);

        if (selectedTable) {
          updateTableStatus(selectedTable.id, 'occupied');
        }

        // Imprimer la commande vers les imprimantes appropriées (cuisine/bar)
        try {
          await printService.printOrder(
            cart,
            categories.map(c => c.name),
            order.type,
            order.tableId
          );
        } catch (printError) {
          console.error('Erreur impression:', printError);
          // Continuer même si l'impression échoue
        }

        alert(`Commande envoyée avec succès !\nTotal: ${total.toLocaleString('fr-FR')} CFA`);
      }

      setCart([]);
      setNotes('');
      onBack();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la commande:', error);
      alert('Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
            >
              Retour
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTable ? `Table ${selectedTable.number}` : 'Nouvelle commande'}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedTable 
                  ? `${selectedTable.capacity} places - Section ${selectedTable.section}`
                  : 'À emporter / Livraison'
                }
              </p>
            </div>
          </div>
          
          {!selectedTable && (
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType('takeaway')}
                className={`px-3 py-1 rounded text-sm ${
                  orderType === 'takeaway' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                À emporter
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-3 py-1 rounded text-sm ${
                  orderType === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Livraison
              </button>
            </div>
          )}
        </div>
        
        {/* Indicateur d'ajout à commande existante */}
        {isAddingToExisting && existingOrder && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">
                  Ajout à la commande #{existingOrder.orderNumber}
                </p>
                <p className="text-sm text-amber-700">
                  Articles actuels: {existingOrder.items.length} • 
                  Total actuel: {existingOrder.total.toLocaleString('fr-FR')} CFA
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Section des produits */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtres */}
          <Card padding="sm">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
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

          {/* Grille des produits */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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

        {/* Panier */}
        <div className="space-y-3">
          {/* Commande existante (si ajout) */}
          {isAddingToExisting && existingOrder && (
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Commande actuelle
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {existingOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-100 rounded text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.size && <p className="text-xs text-gray-600">{item.size}</p>}
                    </div>
                    <span className="text-xs">{item.quantity}x</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total actuel:</span>
                  <span>{existingOrder.total.toLocaleString('fr-FR')} CFA</span>
                </div>
              </div>
            </Card>
          )}

          {/* Nouveaux articles */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {isAddingToExisting ? 'Nouveaux articles' : 'Commande'}
              </h3>
              {cart.length > 0 && (
                <span className="text-sm text-gray-600">{cart.length} articles</span>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    {item.size && (
                      <p className="text-xs text-gray-600">{item.size}</p>
                    )}
                    <p className="text-xs text-gray-600">{item.price.toLocaleString('fr-FR')} CFA</p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
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
                      className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-700 ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">
                  {isAddingToExisting ? 'Aucun nouvel article' : 'Aucun article sélectionné'}
                </p>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales pour la cuisine..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={3}
            />
          </Card>

          {/* Total et envoi */}
          {cart.length > 0 && (
            <Card padding="sm">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{isAddingToExisting ? 'Sous-total ajout' : 'Sous-total'}</span>
                  <span>{subtotal.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA (10%)</span>
                  <span>{tax.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{isAddingToExisting ? 'Total ajout' : 'Total'}</span>
                  <span>{total.toLocaleString('fr-FR')} CFA</span>
                </div>

                {/* Nouveau total si ajout */}
                {isAddingToExisting && existingOrder && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between font-bold text-lg text-blue-900">
                      <span>Nouveau total commande:</span>
                      <span>{(existingOrder.total + total).toLocaleString('fr-FR')} CFA</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={sendOrder}
                  className="w-full"
                  size="lg"
                  icon={Send}
                >
                  {isAddingToExisting ? 'Ajouter à la commande' : 'Envoyer la commande'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterPOS;