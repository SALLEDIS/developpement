import React from 'react';
import { X, Printer, CreditCard, Download } from 'lucide-react';
import Button from '../ui/Button';
import { OrderItem, Customer } from '../../types';

interface BillPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  customer: Customer | null;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  onProceedToPayment: () => void;
  onPrintBill: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({
  isOpen,
  onClose,
  items,
  customer,
  notes,
  subtotal,
  tax,
  total,
  paymentMethod,
  onProceedToPayment,
  onPrintBill,
}) => {
  if (!isOpen) return null;

  const currentDate = new Date();
  const billNumber = `FACT-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte bancaire';
      case 'digital': return 'Paiement digital';
      default: return method;
    }
  };

  const downloadPDF = () => {
    // Créer le contenu HTML pour le PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Addition ${billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
            .info { margin: 20px 0; }
            .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f3f4f6; }
            .total { text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍽️ RESTOBAR</div>
            <p>123 Avenue Principale<br>Abidjan, Côte d'Ivoire<br>Tél: +225 01 02 03 04 05</p>
          </div>
          
          <div class="info">
            <h2>ADDITION</h2>
            <p><strong>N° Facture:</strong> ${billNumber}</p>
            <p><strong>Date:</strong> ${currentDate.toLocaleDateString('fr-FR')} ${currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            ${customer ? `<p><strong>Client:</strong> ${customer.name}</p>` : ''}
            <p><strong>Paiement:</strong> ${getPaymentMethodText(paymentMethod)}</p>
          </div>
          
          <table class="items">
            <thead>
              <tr>
                <th>Article</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>
                    ${item.productName}
                    ${item.size ? `<br><small>Taille: ${item.size}</small>` : ''}
                    ${item.notes ? `<br><small>Note: ${item.notes}</small>` : ''}
                  </td>
                  <td>${item.price.toLocaleString('fr-FR')} CFA</td>
                  <td>${item.quantity}</td>
                  <td>${(item.price * item.quantity).toLocaleString('fr-FR')} CFA</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${notes ? `<div class="info"><strong>Notes:</strong> ${notes}</div>` : ''}
          
          <div class="total">
            <p>Sous-total: ${subtotal.toLocaleString('fr-FR')} CFA</p>
            <p>TVA (10%): ${tax.toLocaleString('fr-FR')} CFA</p>
            <h3>TOTAL: ${total.toLocaleString('fr-FR')} CFA</h3>
          </div>
          
          <div class="footer">
            <p>Merci de votre visite !<br>À bientôt chez RestoBar</p>
          </div>
        </body>
      </html>
    `;

    // Créer un blob et télécharger
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `addition-${billNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Addition sauvegardée en HTML ! Vous pouvez l\'ouvrir dans un navigateur et l\'imprimer en PDF.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Addition</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu de l'addition */}
          <div className="p-4">
            {/* Informations restaurant */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-900">🍽️ RestoBar</h1>
              <p className="text-sm text-gray-600">123 Avenue Principale</p>
              <p className="text-sm text-gray-600">Abidjan, Côte d'Ivoire</p>
              <p className="text-sm text-gray-600">Tél: +225 01 02 03 04 05</p>
            </div>

            {/* Informations facture */}
            <div className="border-t border-b border-gray-200 py-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>N° Facture:</span>
                <span className="font-medium">{billNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span>{currentDate.toLocaleDateString('fr-FR')} {currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {customer && (
                <div className="flex justify-between text-sm">
                  <span>Client:</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Paiement:</span>
                <span>{getPaymentMethodText(paymentMethod)}</span>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-2 mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Articles commandés:</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.size && (
                      <p className="text-xs text-gray-500">Taille: {item.size}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500">Note: {item.notes}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {item.price.toLocaleString('fr-FR')} CFA × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} CFA
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-4 p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Note: {notes}</p>
              </div>
            )}

            {/* Totaux */}
            <div className="border-t border-gray-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span>{subtotal.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (10%):</span>
                <span>{tax.toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>TOTAL:</span>
                <span>{total.toLocaleString('fr-FR')} CFA</span>
              </div>
            </div>

            {/* Message de remerciement */}
            <div className="text-center mt-6 text-xs text-gray-500">
              <p>Merci de votre visite !</p>
              <p>À bientôt chez RestoBar</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onPrintBill}
                variant="secondary"
                className="w-full"
                icon={Printer}
                size="sm"
              >
                Imprimer
              </Button>
              <Button
                onClick={downloadPDF}
                variant="secondary"
                className="w-full"
                icon={Download}
                size="sm"
              >
                Sauvegarder PDF
              </Button>
            </div>
            <Button
              onClick={onProceedToPayment}
              className="w-full"
              icon={CreditCard}
            >
              Procéder au paiement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPreview;