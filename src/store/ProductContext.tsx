'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';
import { products as defaultProducts } from '@/data/products';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

const FIRESTORE_COLLECTION = 'products';

interface ProductContextType {
  allProducts: Product[];
  addProduct: (product: Product, imageUrl?: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getTrendingProducts: () => Product[];
  getNewArrivals: () => Product[];
  searchProducts: (query: string) => Product[];
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for Firestore products — updates across ALL devices instantly
  useEffect(() => {
    console.log('[ProductContext] Setting up real-time Firestore listener...');

    const q = query(collection(db, FIRESTORE_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreProducts: Product[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            ...data,
            id: data.originalId || docSnap.id,
            firestoreId: docSnap.id,
          } as Product & { firestoreId: string };
        });

        console.log(`[ProductContext] Firestore snapshot received: ${firestoreProducts.length} admin products`);
        setAdminProducts(firestoreProducts);
        setIsLoading(false);
      },
      (error) => {
        console.error('[ProductContext] Firestore real-time listener error:', error);
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('[ProductContext] Cleaning up Firestore listener');
      unsubscribe();
    };
  }, []);

  // Merge: admin-added products first, then default products
  const allProducts = [...adminProducts, ...defaultProducts];

  const addProduct = useCallback(async (product: Product, imageUrl?: string) => {
    // Use provided imageUrl, or fall back to product's existing image, or default
    const finalImageUrl = imageUrl && imageUrl.trim()
      ? imageUrl.trim()
      : (product.images[0] && !product.images[0].startsWith('data:'))
        ? product.images[0]
        : '/images/products/kurta-navy.png';

    // Save to Firestore (triggers onSnapshot on ALL devices instantly)
    try {
      const productData = {
        ...product,
        images: [finalImageUrl],
        originalId: product.id,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), productData);
      console.log(`[ProductContext] Product saved to Firestore with ID: ${docRef.id}`);
    } catch (e) {
      console.error('[ProductContext] Failed to save product to Firestore:', e);
      throw e;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    // Find the product to get its Firestore ID
    const productToDelete = adminProducts.find(p => p.id === id);

    // Delete from Firestore (onSnapshot will automatically update all devices)
    if (productToDelete) {
      try {
        const firestoreId = (productToDelete as Product & { firestoreId?: string }).firestoreId;
        if (firestoreId) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTION, firestoreId));
          console.log(`[ProductContext] Product deleted from Firestore: ${firestoreId}`);
        } else {
          // Search all docs to find by originalId
          console.warn('[ProductContext] No firestoreId found, searching by originalId...');
          const q = query(collection(db, FIRESTORE_COLLECTION));
          // We need getDocs for this one-off search
          const { getDocs } = await import('firebase/firestore');
          const snapshot = await getDocs(q);
          for (const docSnap of snapshot.docs) {
            if (docSnap.data().originalId === id) {
              await deleteDoc(doc(db, FIRESTORE_COLLECTION, docSnap.id));
              console.log(`[ProductContext] Product deleted by originalId: ${docSnap.id}`);
              break;
            }
          }
        }
      } catch (e) {
        console.error('[ProductContext] Failed to delete product from Firestore:', e);
      }
    } else {
      console.warn(`[ProductContext] Product not found for deletion: ${id}`);
    }
  }, [adminProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const productToUpdate = adminProducts.find(p => p.id === id);
    if (!productToUpdate) {
      console.warn(`[ProductContext] Product not found for update: ${id}`);
      return;
    }
    const firestoreId = (productToUpdate as Product & { firestoreId?: string }).firestoreId;
    if (!firestoreId) {
      console.warn('[ProductContext] No firestoreId for update, skipping');
      return;
    }
    try {
      await updateDoc(doc(db, FIRESTORE_COLLECTION, firestoreId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[ProductContext] Product updated in Firestore: ${firestoreId}`);
    } catch (e) {
      console.error('[ProductContext] Failed to update product in Firestore:', e);
      throw e;
    }
  }, [adminProducts]);

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

  const searchProducts = useCallback((searchQuery: string): Product[] => {
    const q = searchQuery.toLowerCase();
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
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
        getTrendingProducts,
        getNewArrivals,
        searchProducts,
        isLoading,
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
