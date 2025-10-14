import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Printer } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import { useProducts } from '../../hooks/useProducts';

const ProductsManagement: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (categoryData: any) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      deleteCategory(categoryId);
    }
  };

  const getPrinterIcon = (printer: string) => {
    return <Printer className={`h-4 w-4 ${
      printer === 'cuisine' ? 'text-orange-500' : 
      printer === 'bar' ? 'text-blue-500' : 
      'text-gray-500'
    }`} />;
  };

  const getPrinterText = (printer: string) => {
    switch (printer) {
      case 'cuisine': return 'Cuisine';
      case 'bar': return 'Bar';
      case 'caisse': return 'Caisse';
      default: return 'Non défini';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des produits</h2>
          <p className="text-gray-600">Gérez vos produits, catégories et affectations d'imprimantes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCategory} variant="secondary" icon={Plus}>
            Nouvelle catégorie
          </Button>
          <Button onClick={handleCreateProduct} icon={Plus}>
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-sm text-gray-600">Total produits</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Produits actifs</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-gray-600">Catégories</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {products.filter(p => (p.stock || 0) < 10).length}
          </div>
          <div className="text-sm text-gray-600">Stock faible</div>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              iconPosition="left"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Gestion des catégories */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
          <Button onClick={handleCreateCategory} size="sm" icon={Plus}>
            Ajouter
          </Button>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">Aucune catégorie</p>
            <p className="text-sm">Créez votre première catégorie pour organiser vos produits</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {products.filter(p => p.category === category.name).length} produits
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Liste des produits */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Produits ({filteredProducts.length})
        </h3>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🍽️</div>
            <h4 className="text-lg font-medium mb-2">
              {products.length === 0 ? 'Aucun produit' : 'Aucun produit trouvé'}
            </h4>
            <p className="text-sm mb-4">
              {products.length === 0 
                ? 'Créez votre premier produit pour commencer à vendre'
                : 'Modifiez vos filtres ou créez un nouveau produit'
              }
            </p>
            <Button onClick={handleCreateProduct} icon={Plus}>
              Créer un produit
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Prix</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Imprimante</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{product.price.toLocaleString('fr-FR')} CFA</span>
                      {product.sizes && (
                        <p className="text-xs text-gray-500">
                          {product.sizes.length} tailles
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        (product.stock || 0) > 10 ? 'text-green-600' : 
                        (product.stock || 0) > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getPrinterIcon(product.printer || 'cuisine')}
                        <span className="text-sm text-gray-600">
                          {getPrinterText(product.printer || 'cuisine')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de création/édition de produit */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Modal de création/édition de catégorie */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      >
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProductsManagement;