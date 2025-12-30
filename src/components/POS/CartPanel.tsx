import React from 'react';
import { ShoppingCart, Plus, Minus, X, Trash2, Printer, Receipt, DollarSign, CreditCard, Clock } from 'lucide-react';
import { OrderItem, Order } from '../../types';

interface CartPanelProps {
  cart: OrderItem[];
  selectedOrder?: Order | null;
  selectedTableNumber?: number;
  total: number;
  subtotal: number;
  tax: number;
  currentTime: Date;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onSendToPrinter: () => void;
  onPrintBill: () => void;
  onOpenCashDrawer: () => void;
  onProcessPayment: () => void;
  onClose: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  selectedOrder,
  selectedTableNumber,
  total,
  subtotal,
  tax,
  currentTime,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSendToPrinter,
  onPrintBill,
  onOpenCashDrawer,
  onProcessPayment,
  onClose,
}) => {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const displayItems = selectedOrder ? selectedOrder.items : cart;
  const isPaymentMode = !!selectedOrder;

  return (
    <div className="w-[700px] bg-white border-l-2 border-gray-200 flex flex-col h-screen">
      <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {selectedTableNumber ? `Table ${selectedTableNumber}` : 'Commande'}
            </h2>
            <p className="text-sm text-blue-100">{displayItems.length} article{displayItems.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200 flex items-center gap-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">
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
                  {item.size && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.size}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{item.price.toLocaleString('fr-FR')} CFA</p>
                </div>

                {isPaymentMode ? (
                  <div className="w-28 text-center font-bold text-base text-gray-700">{item.quantity}</div>
                ) : (
                  <div className="w-28">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-base text-gray-900 w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-green-100 hover:text-green-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="w-32 text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {(item.price * item.quantity).toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-500">CFA</p>
                </div>

                {!isPaymentMode && (
                  <div className="w-10 flex justify-end">
                    <button
                      onClick={() => onRemoveItem(item.id)}
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
              <p className="text-sm mt-2">Sélectionnez une table et ajoutez des produits</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t-2 border-gray-200 bg-white">
        <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total à payer</span>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono font-semibold">{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-5xl font-bold text-gray-900">
                {total.toLocaleString('fr-FR')}
              </div>
              <div className="text-lg font-semibold text-gray-600 mt-1">CFA</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{displayItems.length} article{displayItems.length > 1 ? 's' : ''}</div>
              {subtotal > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  TVA: {tax.toLocaleString('fr-FR')} CFA
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          {!isPaymentMode && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClearCart}
                  disabled={cart.length === 0}
                  className="px-5 py-4 bg-gray-100 hover:bg-red-50 border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-700 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Vider</span>
                </button>
                <button
                  onClick={onSendToPrinter}
                  disabled={cart.length === 0}
                  className="px-5 py-4 bg-orange-500 hover:bg-orange-600 border-2 border-orange-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md font-semibold"
                >
                  <Printer className="h-5 w-5" />
                  <span>Envoyer</span>
                </button>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onPrintBill}
              disabled={displayItems.length === 0}
              className="px-5 py-4 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              <Receipt className="h-5 w-5" />
              <span>Addition</span>
            </button>
            <button
              onClick={onOpenCashDrawer}
              className="px-5 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <DollarSign className="h-5 w-5" />
              <span>Tiroir</span>
            </button>
          </div>

          <button
            onClick={onProcessPayment}
            disabled={displayItems.length === 0}
            className="w-full px-6 py-5 bg-green-600 hover:bg-green-700 border-2 border-green-700 text-white rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg font-bold text-lg"
          >
            <CreditCard className="h-6 w-6" />
            <span>ENCAISSER</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
