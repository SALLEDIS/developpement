import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Printer, X, Copy, Grid3x3, Star, Edit3, Keyboard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchField, setSearchField] = useState('code');

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchField === 'code'
      ? product.id.toLowerCase().includes(searchTerm.toLowerCase())
      : product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setIsProductModalOpen(true);
    } else if (selectedProducts.length === 1) {
      const productToEdit = products.find(p => p.id === selectedProducts[0]);
      setEditingProduct(productToEdit);
      setIsProductModalOpen(true);
    }
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

  const handleDeleteProduct = () => {
    if (selectedProducts.length === 0) return;
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`)) {
      selectedProducts.forEach(id => deleteProduct(id));
      setSelectedProducts([]);
    }
  };

  const handleDuplicateProduct = () => {
    if (selectedProducts.length === 1) {
      const productToDuplicate = products.find(p => p.id === selectedProducts[0]);
      if (productToDuplicate) {
        const duplicatedProduct = {
          ...productToDuplicate,
          name: `${productToDuplicate.name} (Copie)`,
        };
        delete duplicatedProduct.id;
        addProduct(duplicatedProduct);
        setSelectedProducts([]);
      }
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header bleu */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-semibold">Liste des produits</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimer</span>
          </button>
          <button className="p-1.5 bg-blue-700 hover:bg-blue-800 rounded transition-colors">
            <Keyboard className="h-5 w-5" />
          </button>
          <button className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-gray-200 px-4 py-2 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Star className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Nouveau</span>
          </button>
          <button
            onClick={() => handleEditProduct()}
            disabled={selectedProducts.length !== 1}
            className={`flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-400 rounded transition-colors shadow-sm ${
              selectedProducts.length === 1
                ? 'hover:bg-gray-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Edit3 className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Éditer</span>
          </button>
          <button
            onClick={handleDeleteProduct}
            disabled={selectedProducts.length === 0}
            className={`flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-400 rounded transition-colors shadow-sm ${
              selectedProducts.length > 0
                ? 'hover:bg-gray-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <X className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Supprimer</span>
          </button>
          <button
            onClick={handleDuplicateProduct}
            disabled={selectedProducts.length !== 1}
            className={`flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-400 rounded transition-colors shadow-sm ${
              selectedProducts.length === 1
                ? 'hover:bg-gray-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Copy className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Dupliquer</span>
          </button>
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Grid3x3 className="h-4 w-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Gestion catégories</span>
        </button>
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-200 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-12">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-24">Code article</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 min-w-[200px]">Désignation</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-28">Prix vente</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-28">Px emporté</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-28">Prix achat</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-36">Catégorie</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-36">Sous catégorie</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-24">Qte stock</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-24">Qte Min.</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 border-r border-gray-300 w-36">Fournisseur</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-200 w-36">Ref art fourni</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${selectedProducts.includes(product.id) ? 'bg-blue-100' : ''}`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    toggleProductSelection(product.id);
                  }
                }}
              >
                <td className="px-3 py-2 border-r border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">{product.id.slice(0, 8)}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 font-medium">{product.name}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 text-right">{product.price.toLocaleString('fr-FR')}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 text-right">{product.price.toLocaleString('fr-FR')}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 text-right">{Math.floor(product.price * 0.6).toLocaleString('fr-FR')}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">{product.category}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">{product.printer || 'NON DÉFINI'}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 text-right">{product.stock || 0}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 text-right">{product.minStock || 0}</td>
                <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">{product.supplier || ''}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{product.supplierRef || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barre de recherche en bas */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Recherche par :</span>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="px-3 py-1.5 border border-gray-400 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="code">Code article</option>
              <option value="name">Désignation</option>
            </select>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="mot contenu"
            className="px-3 py-1.5 border border-gray-400 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors">
            <ChevronsLeft className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1.5 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors">
            <ChevronsRight className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

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

      {/* Modal de gestion des catégories */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title="Gestion des catégories"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setEditingCategory({})}
              icon={Plus}
              size="sm"
            >
              Nouvelle catégorie
            </Button>
          </div>

          {editingCategory !== null ? (
            <CategoryForm
              category={editingCategory}
              onSave={(categoryData) => {
                if (editingCategory.id) {
                  updateCategory(editingCategory.id, categoryData);
                } else {
                  addCategory(categoryData);
                }
                setEditingCategory(null);
              }}
              onCancel={() => setEditingCategory(null)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-auto">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {products.filter(p => p.category === category.name).length} produits
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                          deleteCategory(category.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
