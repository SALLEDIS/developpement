import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, FileText, Clock, Check, X, Settings, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { usePaymentMethods, PaymentMethod } from '../../hooks/usePaymentMethods';

const iconMap: Record<string, any> = {
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Clock,
};

const PaymentSettings: React.FC = () => {
  const { paymentMethods, updatePaymentMethod, resetToDefaults, loading } = usePaymentMethods();
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method.id);
    setFormData(method);
  };

  const handleSave = async () => {
    if (!editingMethod) return;

    try {
      await updatePaymentMethod(editingMethod, formData);
      setEditingMethod(null);
      setFormData({});
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setEditingMethod(null);
    setFormData({});
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    await updatePaymentMethod(method.id, { isActive: !method.isActive });
  };

  const handleResetToDefaults = async () => {
    if (confirm('Réinitialiser tous les paramètres de paiement aux valeurs par défaut ?')) {
      await resetToDefaults();
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Méthodes de paiement</h2>
            <p className="text-gray-600 mt-1">Configurez les méthodes de paiement acceptées dans votre établissement</p>
          </div>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={handleResetToDefaults}
          >
            Réinitialiser
          </Button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = iconMap[method.icon] || CreditCard;
            const isEditing = editingMethod === method.id;

            return (
              <div
                key={method.id}
                className={`border rounded-lg p-6 transition-all ${
                  method.isActive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${method.isActive ? 'bg-blue-100' : 'bg-gray-200'}`}>
                          <Icon className={`h-6 w-6 ${method.isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nom de la méthode"
                          className="text-lg font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <Input
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de frais
                        </label>
                        <select
                          value={formData.feesType || 'fixed'}
                          onChange={(e) => setFormData({ ...formData, feesType: e.target.value as 'percentage' | 'fixed' })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="fixed">Montant fixe</option>
                          <option value="percentage">Pourcentage</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frais {formData.feesType === 'percentage' ? '(%)' : '(CFA)'}
                        </label>
                        <Input
                          type="number"
                          value={formData.fees || 0}
                          onChange={(e) => setFormData({ ...formData, fees: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          step="0.01"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.requiresReceipt || false}
                            onChange={(e) => setFormData({ ...formData, requiresReceipt: e.target.checked })}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Reçu obligatoire</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button onClick={handleSave} icon={Check}>
                        Enregistrer
                      </Button>
                      <Button variant="secondary" onClick={handleCancel} icon={X}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${method.isActive ? 'bg-blue-100' : 'bg-gray-200'}`}>
                        <Icon className={`h-6 w-6 ${method.isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                          {method.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Actif
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Inactif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Frais: {method.fees > 0
                              ? `${method.fees}${method.feesType === 'percentage' ? '%' : ' CFA'}`
                              : 'Aucun'}
                          </span>
                          {method.requiresReceipt && (
                            <span className="text-sm text-gray-500">• Reçu obligatoire</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Settings}
                        onClick={() => handleEdit(method)}
                      >
                        Modifier
                      </Button>
                      <button
                        onClick={() => handleToggleActive(method)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          method.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            method.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Informations</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Les méthodes actives apparaîtront dans le point de vente</li>
          <li>• Les frais en pourcentage sont calculés sur le montant total de la commande</li>
          <li>• Les frais fixes sont ajoutés au montant total</li>
          <li>• Le reçu obligatoire nécessite une validation supplémentaire lors du paiement</li>
          <li>• Seules les méthodes actives sont disponibles pour les transactions</li>
        </ul>
      </Card>
    </div>
  );
};

export default PaymentSettings;
