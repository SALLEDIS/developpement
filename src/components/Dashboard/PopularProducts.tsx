import React from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { Product } from '../../types';

interface PopularProductsProps {
  products: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits populaires</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-gray-900">
                {product.price.toLocaleString('fr-FR')} CFA
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PopularProducts;