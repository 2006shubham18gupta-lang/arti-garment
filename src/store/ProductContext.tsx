'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';
import { products as defaultProducts } from '@/data/products';

const STORAGE_KEY = 'arti-admin-products';

interface ProductContextType {
  allProducts: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getTrendingProducts: () => Product[];
  getNewArrivals: () => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load admin-added products from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAdminProducts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load admin products:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save admin-added products to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProducts));
    } catch (e) {
      console.error('Failed to save admin products:', e);
    }
  }, [adminProducts, isLoaded]);

  // Merge: admin-added products first, then default products
  const allProducts = [...adminProducts, ...defaultProducts];

  const addProduct = useCallback((product: Product) => {
    setAdminProducts(prev => [product, ...prev]);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setAdminProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProductById = useCallback((id: string): Product | undefined => {
    return allProducts.find(p => p.id === id);
  }, [allProducts]);

  const getProductsByCategory = useCallback((category: string): Product[] => {
    return allProducts.filter(p => p.category === category);
  }, [allProducts]);

  const getTrendingProducts = useCallback((): Product[] => {
    return allProducts.filter(p => p.isTrending);
  }, [allProducts]);

  const getNewArrivals = useCallback((): Product[] => {
    return allProducts.filter(p => p.isNew);
  }, [allProducts]);

  const searchProducts = useCallback((query: string): Product[] => {
    const q = query.toLowerCase();
    return allProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [allProducts]);

  return (
    <ProductContext.Provider
      value={{
        allProducts,
        addProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
        getTrendingProducts,
        getNewArrivals,
        searchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
}
