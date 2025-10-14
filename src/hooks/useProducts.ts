import { useState, useEffect, createContext, useContext } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getActiveProducts: () => Product[];
  getProductsByCategory: (categoryName: string) => Product[];
  isLoading: boolean;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les catégories depuis Supabase
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedCategories: Category[] = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          isActive: cat.is_active,
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Charger les produits depuis Supabase
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedProducts: Product[] = data.map(prod => ({
          id: prod.id,
          name: prod.name,
          description: prod.description || '',
          category: prod.category,
          price: Number(prod.price),
          sizes: prod.sizes,
          image: prod.image || undefined,
          printer: prod.printer || undefined,
          isActive: prod.is_active,
          stockQuantity: prod.stock_quantity,
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadCategories(), loadProducts()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description || null,
          category: product.category,
          price: product.price,
          sizes: product.sizes || null,
          image: product.image || null,
          printer: product.printer || null,
          is_active: product.isActive,
          stock_quantity: product.stockQuantity || 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          category: data.category,
          price: Number(data.price),
          sizes: data.sizes,
          image: data.image || undefined,
          printer: data.printer || undefined,
          isActive: data.is_active,
          stockQuantity: data.stock_quantity,
        };
        setProducts([...products, newProduct]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>) => {
    try {
      const updateData: any = {};
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description || null;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.price !== undefined) updateData.price = product.price;
      if (product.sizes !== undefined) updateData.sizes = product.sizes;
      if (product.image !== undefined) updateData.image = product.image || null;
      if (product.printer !== undefined) updateData.printer = product.printer || null;
      if (product.isActive !== undefined) updateData.is_active = product.isActive;
      if (product.stockQuantity !== undefined) updateData.stock_quantity = product.stockQuantity;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description || null,
          is_active: category.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          isActive: data.is_active,
        };
        setCategories([...categories, newCategory]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Omit<Category, 'id'>>) => {
    try {
      const updateData: any = {};
      if (category.name !== undefined) updateData.name = category.name;
      if (category.description !== undefined) updateData.description = category.description || null;
      if (category.isActive !== undefined) updateData.is_active = category.isActive;

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      throw error;
    }
  };

  const getActiveProducts = () => {
    return products.filter(p => p.isActive);
  };

  const getProductsByCategory = (categoryName: string) => {
    return products.filter(p => p.category === categoryName && p.isActive);
  };

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
    isLoading,
  };
};

export { ProductContext };
