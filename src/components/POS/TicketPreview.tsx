import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import Button from '../ui/Button';
import { OrderItem, Customer } from '../../types';

interface TicketPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  customer: Customer | null;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  onPrint: () => void;
}

const TicketPreview: React.FC<TicketPreviewProps> = ({
  isOpen,
  onClose,
  items,
  customer,
  notes,
  subtotal,
  tax,
  total,
  paymentMethod,
  onPrint,
}) => {
  if (!isOpen) return null;

  const currentDate = new Date();
  const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'ESPECES';
      case 'card': return 'CARTE';
      case 'digital': return 'DIGITAL';
      default: return method.toUpperCase();
    }
  };

  const downloadPDF = () => {
    // Créer le contenu HTML pour le ticket
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket ${ticketNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              line-height: 1.2; 
              margin: 0; 
              padding: 10px; 
              width: 80mm;
              max-width: 80mm;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed { border-bottom: 1px dashed #000; margin: 5px 0; }
            .flex { display: flex; justify-content: space-between; }
            @media print {
              body { margin: 0; padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="center bold">🍽️ RESTOBAR</div>
          <div class="center">123 Avenue Principale</div>
          <div class="center">Abidjan, Cote d'Ivoire</div>
          <div class="center">Tel: +225 01 02 03 04 05</div>
          <div class="dashed"></div>
          
          <div class="flex">
            <span>Ticket:</span>
            <span>${ticketNumber}</span>
          </div>
          <div class="flex">
            <span>Date:</span>
            <span>${currentDate.toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="flex">
            <span>Heure:</span>
            <span>${currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          ${customer ? `
          <div class="flex">
            <span>Client:</span>
            <span>${customer.name}</span>
          </div>
          ` : ''}
          <div class="dashed"></div>
          
          ${items.map(item => `
            <div>
              <div class="bold">${item.productName}</div>
              ${item.size ? `<div>  Taille: ${item.size}</div>` : ''}
              <div class="flex">
                <span>  ${item.quantity} x ${item.price.toLocaleString('fr-FR')}</span>
                <span>${(item.price * item.quantity).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          `).join('')}
          
          <div class="dashed"></div>
          
          ${notes ? `
          <div>
            <div class="bold">Note:</div>
            <div>${notes}</div>
          </div>
          <div class="dashed"></div>
          ` : ''}
          
          <div class="flex">
            <span>Sous-total:</span>
            <span>${subtotal.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div class="flex">
            <span>TVA (10%):</span>
            <span>${tax.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div class="dashed"></div>
          <div class="flex bold">
            <span>TOTAL:</span>
            <span>${total.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div class="dashed"></div>
          
          <div class="flex bold">
            <span>PAIEMENT:</span>
            <span>${getPaymentMethodText(paymentMethod)}</span>
          </div>
          <div class="flex">
            <span>Montant reçu:</span>
            <span>${total.toLocaleString('fr-FR')} CFA</span>
          </div>
          <div class="flex">
            <span>Monnaie:</span>
            <span>0 CFA</span>
          </div>
          <div class="dashed"></div>
          
          <div class="center">Merci de votre visite!</div>
          <div class="center">A bientot chez RestoBar</div>
          <div class="center">www.restobar.ci</div>
        </body>
      </html>
    `;

    // Créer un blob et télécharger
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticketNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Ticket sauvegardé en HTML ! Vous pouvez l\'ouvrir dans un navigateur et l\'imprimer en PDF.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Aperçu Ticket 80mm</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Simulation ticket 80mm */}
          <div className="p-4">
            <div 
              className="bg-white border border-gray-300 p-3 font-mono text-xs leading-tight"
              style={{ width: '80mm', minHeight: '100mm', fontSize: '10px' }}
            >
              {/* En-tête restaurant */}
              <div className="text-center mb-3">
                <div className="font-bold text-sm">🍽️ RESTOBAR</div>
                <div>123 Avenue Principale</div>
                <div>Abidjan, Cote d'Ivoire</div>
                <div>Tel: +225 01 02 03 04 05</div>
                <div className="border-b border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Informations commande */}
              <div className="mb-3">
                <div className="flex justify-between">
                  <span>Ticket:</span>
                  <span>{ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{currentDate.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heure:</span>
                  <span>{currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {customer && (
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="truncate ml-2">{customer.name}</span>
                  </div>
                )}
                <div className="border-b border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Articles */}
              <div className="mb-3">
                {items.map((item, index) => (
                  <div key={item.id} className="mb-2">
                    <div className="font-medium">{item.productName}</div>
                    {item.size && (
                      <div className="text-gray-600">  Taille: {item.size}</div>
                    )}
                    <div className="flex justify-between">
                      <span>  {item.quantity} x {item.price.toLocaleString('fr-FR')}</span>
                      <span>{(item.price * item.quantity).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
                <div className="border-b border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="mb-3">
                  <div className="font-medium">Note:</div>
                  <div className="text-gray-600 break-words">{notes}</div>
                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                </div>
              )}

              {/* Totaux */}
              <div className="mb-3">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{subtotal.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (10%):</span>
                  <span>{tax.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="border-b border-dashed border-gray-400 my-1"></div>
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>{total.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="border-b border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Paiement */}
              <div className="mb-3">
                <div className="flex justify-between font-medium">
                  <span>PAIEMENT:</span>
                  <span>{getPaymentMethodText(paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant reçu:</span>
                  <span>{total.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Monnaie:</span>
                  <span>0 CFA</span>
                </div>
                <div className="border-b border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Pied de page */}
              <div className="text-center text-xs">
                <div>Merci de votre visite!</div>
                <div>A bientot chez RestoBar</div>
                <div className="mt-2">www.restobar.ci</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t bg-gray-50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onPrint}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreview;