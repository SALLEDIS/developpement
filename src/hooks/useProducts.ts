import { useState, useEffect, createContext, useContext } from 'react';
import { Product, Category } from '../types';
import { mockCategories } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  getActiveProducts: () => Product[];
  getProductsByCategory: (categoryName: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts doit être utilisé dans un ProductProvider');
  }
  return context;
};

export const useProductProvider = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (!isInitialized) {
      console.log('useProducts - Initialisation du hook');
      
      // Charger les produits depuis le localStorage
      const storedProducts = localStorage.getItem('restobar_products');
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts)) {
            setProducts(parsedProducts);
            console.log('useProducts - Produits chargés depuis localStorage:', parsedProducts.length);
          }
        } catch (error) {
          console.error('useProducts - Erreur lors du chargement des produits:', error);
          setProducts([]);
        }
      }

      // Charger les catégories depuis le localStorage
      const storedCategories = localStorage.getItem('restobar_categories');
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories)) {
            setCategories(parsedCategories);
            console.log('useProducts - Catégories chargées depuis localStorage:', parsedCategories.length);
          }
        } catch (error) {
          console.error('useProducts - Erreur lors du chargement des catégories:', error);
          setCategories(mockCategories);
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Sauvegarder automatiquement les produits (avec protection contre les boucles)
  useEffect(() => {
    if (isInitialized && products.length >= 0) {
      try {
        const productsJson = JSON.stringify(products);
        const currentStored = localStorage.getItem('restobar_products');
        
        // Ne sauvegarder que si les données ont changé
        if (currentStored !== productsJson) {
          localStorage.setItem('restobar_products', productsJson);
          console.log('useProducts - Produits sauvegardés automatiquement:', products.length);
        }
      } catch (error) {
        console.error('useProducts - Erreur lors de la sauvegarde des produits:', error);
      }
    }
  }, [products, isInitialized]);

  // Sauvegarder automatiquement les catégories (avec protection contre les boucles)
  useEffect(() => {
    if (isInitialized && categories.length > 0) {
      try {
        const categoriesJson = JSON.stringify(categories);
        const currentStored = localStorage.getItem('restobar_categories');
        
        // Ne sauvegarder que si les données ont changé
        if (currentStored !== categoriesJson) {
          localStorage.setItem('restobar_categories', categoriesJson);
          console.log('useProducts - Catégories sauvegardées automatiquement:', categories.length);
        }
      } catch (error) {
        console.error('useProducts - Erreur lors de la sauvegarde des catégories:', error);
      }
    }
  }, [categories, isInitialized]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
      };
      
      setProducts(prev => {
        const updatedProducts = [...prev, newProduct];
        console.log('useProducts - Nouveau produit ajouté:', newProduct.name, 'Total:', updatedProducts.length);
        return updatedProducts;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de l\'ajout du produit:', error);
    }
  };

  const updateProduct = (id: string, productData: Omit<Product, 'id'>) => {
    try {
      setProducts(prev => {
        const updatedProducts = prev.map(p => 
          p.id === id ? { ...productData, id } : p
        );
        console.log('useProducts - Produit mis à jour:', productData.name);
        return updatedProducts;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de la mise à jour du produit:', error);
    }
  };

  const deleteProduct = (id: string) => {
    try {
      setProducts(prev => {
        const updatedProducts = prev.filter(p => p.id !== id);
        console.log('useProducts - Produit supprimé, Total restant:', updatedProducts.length);
        return updatedProducts;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de la suppression du produit:', error);
    }
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      };
      
      setCategories(prev => {
        const updatedCategories = [...prev, newCategory];
        console.log('useProducts - Nouvelle catégorie ajoutée:', newCategory.name);
        return updatedCategories;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  const updateCategory = (id: string, categoryData: Omit<Category, 'id'>) => {
    try {
      setCategories(prev => {
        const updatedCategories = prev.map(c => 
          c.id === id ? { ...categoryData, id } : c
        );
        console.log('useProducts - Catégorie mise à jour:', categoryData.name);
        return updatedCategories;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de la mise à jour de la catégorie:', error);
    }
  };

  const deleteCategory = (id: string) => {
    try {
      setCategories(prev => {
        const updatedCategories = prev.filter(c => c.id !== id);
        console.log('useProducts - Catégorie supprimée');
        return updatedCategories;
      });
    } catch (error) {
      console.error('useProducts - Erreur lors de la suppression de la catégorie:', error);
    }
  };

  const getActiveProducts = () => {
    const activeProducts = products.filter(p => p.isActive);
    console.log('useProducts - getActiveProducts:', activeProducts.length, 'sur', products.length);
    return activeProducts;
  };

  const getProductsByCategory = (categoryName: string) => {
    const categoryProducts = products.filter(p => p.category === categoryName && p.isActive);
    console.log('useProducts - getProductsByCategory:', categoryName, '=', categoryProducts.length, 'produits');
    return categoryProducts;
  };

  // Debug: Log des changements d'état
  useEffect(() => {
    console.log('useProducts - État actuel:', {
      products: products.length,
      categories: categories.length,
      isInitialized
    });
  }, [products.length, categories.length, isInitialized]);

  return {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    getActiveProducts,
    getProductsByCategory,
  };
};

export { ProductContext };