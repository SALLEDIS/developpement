import React, { useState, useEffect } from 'react';
import { Plus, Minus, Printer, Upload, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Product, Category } from '../../types';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

interface ProductSize {
  name: string;
  price: number;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    isActive: true,
    printer: 'cuisine' as 'cuisine' | 'bar' | 'caisse',
    image: '',
  });
  
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        stock: product.stock || 0,
        isActive: product.isActive,
        printer: product.printer || 'cuisine',
        image: product.image || '',
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
      
      if (product.sizes && product.sizes.length > 0) {
        setSizes(product.sizes);
        setHasSizes(true);
      }
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    handleInputChange('image', '');
  };

  const handleAddSize = () => {
    setSizes(prev => [...prev, { name: '', price: 0 }]);
  };

  const handleRemoveSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: 'name' | 'price', value: string | number) => {
    setSizes(prev => prev.map((size, i) => 
      i === index ? { ...size, [field]: value } : size
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Omit<Product, 'id'> = {
      ...formData,
      sizes: hasSizes && sizes.length > 0 ? sizes : undefined,
    };
    
    onSave(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nom du produit"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Description (optionnelle)"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Description du produit (facultatif)"
      />

      {/* Upload d'image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image du produit <span className="text-gray-400 font-normal">(optionnelle)</span>
        </label>

        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Cliquez pour ajouter une image ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 5MB (optionnel)
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Vous pouvez créer un produit sans image et l'ajouter plus tard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Prix de base (CFA)"
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
          required
        />
        
        <Input
          label="Stock"
          type="number"
          value={formData.stock}
          onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imprimante
          </label>
          <select
            value={formData.printer}
            onChange={(e) => handleInputChange('printer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cuisine">Cuisine</option>
            <option value="bar">Bar</option>
            <option value="caisse">Caisse</option>
          </select>
        </div>
      </div>

      {/* Gestion des tailles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => {
                setHasSizes(e.target.checked);
                if (!e.target.checked) {
                  setSizes([]);
                }
              }}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Ce produit a plusieurs tailles
            </span>
          </label>
          
          {hasSizes && (
            <Button type="button" onClick={handleAddSize} size="sm" icon={Plus}>
              Ajouter une taille
            </Button>
          )}
        </div>

        {hasSizes && (
          <div className="space-y-3">
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Nom de la taille"
                  value={size.name}
                  onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Prix (CFA)"
                  type="number"
                  value={size.price}
                  onChange={(e) => handleSizeChange(index, 'price', parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statut actif */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Produit actif
          </span>
        </label>
      </div>

      {/* Aperçu de l'imprimante */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Printer className={`h-5 w-5 ${
            formData.printer === 'cuisine' ? 'text-orange-500' : 
            formData.printer === 'bar' ? 'text-blue-500' : 
            'text-gray-500'
          }`} />
          <span className="font-medium text-gray-900">
            Imprimante : {formData.printer === 'cuisine' ? 'Cuisine' : 
                         formData.printer === 'bar' ? 'Bar' : 'Caisse'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Les commandes de ce produit seront envoyées à l'imprimante {formData.printer}.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {product ? 'Modifier' : 'Créer'} le produit
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;