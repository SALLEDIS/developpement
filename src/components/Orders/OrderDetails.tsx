import React, { useState } from 'react';
import { Clock, User, MapPin, FileText, Printer, Edit, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Order } from '../../types';

interface OrderDetailsProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onUpdateStatus,
  onClose,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const statusOptions: { value: Order['status']; label: string; color: string }[] = [
    { value: 'pending', label: 'En attente', color: 'amber' },
    { value: 'preparing', label: 'En préparation', color: 'blue' },
    { value: 'ready', label: 'Prêt', color: 'green' },
    { value: 'served', label: 'Servi', color: 'green' },
    { value: 'paid', label: 'Payé', color: 'green' },
    { value: 'cancelled', label: 'Annulé', color: 'red' },
  ];

  const getTypeText = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return 'Sur place';
      case 'takeaway':
        return 'À emporter';
      case 'delivery':
        return 'Livraison';
      case 'kiosk':
        return 'Kiosque';
      default:
        return type;
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'card':
        return 'Carte bancaire';
      case 'digital':
        return 'Paiement digital';
      default:
        return 'Non défini';
    }
  };

  const handleStatusUpdate = () => {
    onUpdateStatus(order.id, selectedStatus);
    onClose();
  };

  const handlePrint = () => {
    alert(`Impression de la commande ${order.orderNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Numéro:</span>
                <span className="font-medium">#{order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Type:</span>
                <span className="font-medium">{getTypeText(order.type)}</span>
              </div>
              {order.tableId && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Table:</span>
                  <span className="font-medium">Table {order.tableId}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Créée le:</span>
                <span className="font-medium">
                  {order.createdAt.toLocaleDateString('fr-FR')} à {order.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Modifiée le:</span>
                <span className="font-medium">
                  {order.updatedAt.toLocaleDateString('fr-FR')} à {order.updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Statut et paiement</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut actuel
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {order.paymentMethod && (
                <div>
                  <span className="text-sm text-gray-600">Méthode de paiement:</span>
                  <span className="ml-2 font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles commandés */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Articles commandés</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  {item.size && (
                    <p className="text-sm text-gray-600">Taille: {item.size}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-600">Note: {item.notes}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {item.price.toLocaleString('fr-FR')} CFA × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString('fr-FR')} CFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Totaux */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Récapitulatif</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Sous-total:</span>
            <span className="font-medium">{order.subtotal.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TVA (10%):</span>
            <span className="font-medium">{order.tax.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-gray-900">{order.total.toLocaleString('fr-FR')} CFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          onClick={handlePrint}
          variant="secondary"
          icon={Printer}
          className="flex-1"
        >
          Imprimer la commande
        </Button>
        
        {selectedStatus !== order.status && (
          <Button
            onClick={handleStatusUpdate}
            icon={CheckCircle}
            className="flex-1"
          >
            Mettre à jour le statut
          </Button>
        )}
        
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;