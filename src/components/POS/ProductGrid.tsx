import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import Modal from '../ui/Modal';

interface ProductGridProps {
  products: any[];
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onProductSelect: (product: any, size?: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onProductSelect,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleProductClick = (product: any) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
    } else {
      onProductSelect(product);
    }
  };

  const handleSizeSelect = (size: string) => {
    if (selectedProduct) {
      onProductSelect(selectedProduct, size);
      setSelectedProduct(null);
    }
  };

  const displayedProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Tous
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name)}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              selectedCategory === category.name
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {displayedProducts.map(product => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {product.name}
              </h3>
              {product.sizes && product.sizes.length > 0 && (
                <Tag className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
              )}
            </div>

            {product.sizes && product.sizes.length > 0 ? (
              <div className="space-y-1 text-sm text-gray-600">
                {product.sizes.map((size: any) => (
                  <div key={size.name} className="flex justify-between">
                    <span>{size.name}</span>
                    <span className="font-semibold">{size.price.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {product.price.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-gray-500 ml-1">CFA</span>
              </div>
            )}

            {product.category && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">{product.category}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedProduct && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          title={`Choisir la taille - ${selectedProduct.name}`}
        >
          <div className="space-y-3">
            {selectedProduct.sizes.map((size: any) => (
              <button
                key={size.name}
                onClick={() => handleSizeSelect(size.name)}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between"
              >
                <span className="text-lg font-semibold text-gray-900">{size.name}</span>
                <span className="text-xl font-bold text-gray-900">
                  {size.price.toLocaleString('fr-FR')} CFA
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductGrid;
