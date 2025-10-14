import React, { useState } from 'react';
import { X, Receipt, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../hooks/useAuth';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense } = useExpenses();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'other' as 'food' | 'supplies' | 'utilities' | 'maintenance' | 'staff' | 'other',
  });

  const categories = [
    { value: 'food', label: 'Alimentation', icon: '🍽️' },
    { value: 'supplies', label: 'Fournitures', icon: '📦' },
    { value: 'utilities', label: 'Services publics', icon: '⚡' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'staff', label: 'Personnel', icon: '👥' },
    { value: 'other', label: 'Autres', icon: '📋' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || formData.amount <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    addExpense({
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      date: new Date(),
      createdBy: user?.id || 'unknown',
    });

    // Réinitialiser le formulaire
    setFormData({
      description: '',
      amount: 0,
      category: 'other',
    });

    alert(`Charge de ${formData.amount.toLocaleString('fr-FR')} CFA enregistrée avec succès !`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Nouvelle charge</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input
              label="Description de la charge"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Achat de légumes, Réparation équipement..."
              required
            />

            <Input
              label="Montant (CFA)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              required
              icon={DollarSign}
              iconPosition="left"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs text-gray-600">{category.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">Résumé :</span>
              </div>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Montant :</span> {formData.amount.toLocaleString('fr-FR')} CFA</p>
                <p><span className="font-medium">Catégorie :</span> {categories.find(c => c.value === formData.category)?.label}</p>
                <p><span className="font-medium">Date :</span> {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                icon={Receipt}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;