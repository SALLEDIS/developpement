import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Category } from '../../types';

interface CategoryFormProps {
  category?: Category | null;
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'utensils',
    isActive: true,
    printer: 'cuisine' as 'cuisine' | 'bar' | 'caisse' | undefined,
  });

  const iconOptions = [
    { value: 'utensils', label: 'Couverts', icon: '🍴' },
    { value: 'chef-hat', label: 'Toque de chef', icon: '👨‍🍳' },
    { value: 'cake', label: 'Gâteau', icon: '🍰' },
    { value: 'glass-water', label: 'Verre d\'eau', icon: '🥤' },
    { value: 'wine', label: 'Vin', icon: '🍷' },
    { value: 'coffee', label: 'Café', icon: '☕' },
    { value: 'pizza', label: 'Pizza', icon: '🍕' },
    { value: 'sandwich', label: 'Sandwich', icon: '🥪' },
    { value: 'salad', label: 'Salade', icon: '🥗' },
    { value: 'ice-cream', label: 'Glace', icon: '🍦' },
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive,
        printer: category.printer || 'cuisine',
      });
    }
  }, [category]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nom de la catégorie"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="Ex: Entrées, Plats, Desserts..."
        required
      />

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Description de la catégorie"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Icône
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {iconOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange('icon', option.value)}
              className={`p-3 rounded-lg border-2 transition-colors text-center ${
                formData.icon === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-xs text-gray-600">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imprimante par défaut
        </label>
        <select
          value={formData.printer || 'cuisine'}
          onChange={(e) => handleInputChange('printer', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cuisine">Cuisine</option>
          <option value="bar">Bar</option>
          <option value="caisse">Caisse</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Les produits de cette catégorie seront imprimés sur cette imprimante
        </p>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Catégorie active
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Les catégories inactives ne seront pas visibles dans les menus
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {category ? 'Modifier' : 'Créer'} la catégorie
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;