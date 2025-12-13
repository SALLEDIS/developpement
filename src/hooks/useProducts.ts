import { useState, useEffect, createContext, useContext } from 'react';
import { Product, Category } from '../types';
import { mockCategories } from '../data/mockData';
import { supabase } from '../lib/supabase';

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

  // Chargement initial des données depuis Supabase
  useEffect(() => {
    if (!isInitialized) {
      console.log('useProducts - Initialisation du hook');

      const loadData = async () => {
        try {
          // Charger les produits depuis Supabase
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*');

          if (productsError) {
            console.error('Erreur lors du chargement des produits:', productsError);
            setProducts([]);
          } else if (productsData) {
            const formattedProducts: Product[] = productsData.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: p.category,
              price: Number(p.price),
              sizes: p.sizes,
              image: p.image,
              isActive: p.is_active,
              stock: p.stock_quantity,
              printer: p.printer,
            }));
            setProducts(formattedProducts);
            console.log('useProducts - Produits chargés depuis Supabase:', formattedProducts.length);
          }

          // Charger les catégories depuis Supabase
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*');

          if (categoriesError) {
            console.error('Erreur lors du chargement des catégories:', categoriesError);
            setCategories(mockCategories);
          } else if (categoriesData) {
            const formattedCategories: Category[] = categoriesData.map((c: any) => ({
              id: c.id,
              name: c.name,
              description: c.description || '',
              icon: 'utensils',
              isActive: c.is_active,
            }));
            setCategories(formattedCategories);
            console.log('useProducts - Catégories chargées depuis Supabase:', formattedCategories.length);
          }
        } catch (error) {
          console.error('useProducts - Erreur lors du chargement des données:', error);
          setProducts([]);
          setCategories(mockCategories);
        } finally {
          setIsInitialized(true);
        }
      };

      loadData();
    }
  }, [isInitialized]);


  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase.from('products').insert([
        {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          sizes: productData.sizes,
          image: productData.image,
          is_active: productData.isActive,
          stock_quantity: productData.stock || 0,
          printer: productData.printer,
        },
      ]).select();

      if (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
      } else if (data && data[0]) {
        const newProduct: Product = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description,
          category: data[0].category,
          price: Number(data[0].price),
          sizes: data[0].sizes,
          image: data[0].image,
          isActive: data[0].is_active,
          stock: data[0].stock_quantity,
          printer: data[0].printer,
        };
        setProducts(prev => [...prev, newProduct]);
        console.log('useProducts - Nouveau produit ajouté:', newProduct.name);
      }
    } catch (error) {
      console.error('useProducts - Erreur lors de l\'ajout du produit:', error);
    }
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          sizes: productData.sizes,
          image: productData.image,
          is_active: productData.isActive,
          stock_quantity: productData.stock || 0,
          printer: productData.printer,
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
      } else {
        setProducts(prev => prev.map(p =>
          p.id === id ? { ...productData, id } : p
        ));
        console.log('useProducts - Produit mis à jour:', productData.name);
      }
    } catch (error) {
      console.error('useProducts - Erreur lors de la mise à jour du produit:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du produit:', error);
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        console.log('useProducts - Produit supprimé');
      }
    } catch (error) {
      console.error('useProducts - Erreur lors de la suppression du produit:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase.from('categories').insert([
        {
          name: categoryData.name,
          description: categoryData.description,
          is_active: categoryData.isActive,
        },
      ]).select();

      if (error) {
        console.error('Erreur lors de l\'ajout de la catégorie:', error);
      } else if (data && data[0]) {
        const newCategory: Category = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          icon: 'utensils',
          isActive: data[0].is_active,
        };
        setCategories(prev => [...prev, newCategory]);
        console.log('useProducts - Nouvelle catégorie ajoutée:', newCategory.name);
      }
    } catch (error) {
      console.error('useProducts - Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  const updateCategory = async (id: string, categoryData: Omit<Category, 'id'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          description: categoryData.description,
          is_active: categoryData.isActive,
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour de la catégorie:', error);
      } else {
        setCategories(prev => prev.map(c =>
          c.id === id ? { ...categoryData, id } : c
        ));
        console.log('useProducts - Catégorie mise à jour:', categoryData.name);
      }
    } catch (error) {
      console.error('useProducts - Erreur lors de la mise à jour de la catégorie:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
      } else {
        setCategories(prev => prev.filter(c => c.id !== id));
        console.log('useProducts - Catégorie supprimée');
      }
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