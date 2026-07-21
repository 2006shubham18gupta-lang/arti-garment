'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';
import { products as defaultProducts } from '@/data/products';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const FIRESTORE_COLLECTION = 'products';

interface ProductContextType {
  allProducts: Product[];
  addProduct: (product: Product, imageFile?: File) => Promise<void>;
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

  const addProduct = useCallback(async (product: Product, imageFile?: File) => {
    let imageUrl = product.images[0] || '/images/products/kurta-navy.png';

    // Upload image to Firebase Storage if a file is provided
    if (imageFile) {
      try {
        const timestamp = Date.now();
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `products/${timestamp}-${safeName}`);
        console.log('[ProductContext] Uploading image to Firebase Storage...');
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log('[ProductContext] Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('[ProductContext] Image upload to Firebase Storage failed:', uploadError);
        // Fall back to default image — do NOT store base64 in Firestore
        imageUrl = '/images/products/kurta-navy.png';
      }
    }

    // Save to Firestore (this will trigger onSnapshot for ALL connected devices)
    try {
      const productData = {
        ...product,
        images: [imageUrl],
        originalId: product.id,
        createdAt: new Date().toISOString(),
      };

      // Remove any base64 image data that may have been accidentally set
      if (productData.images[0] && productData.images[0].startsWith('data:')) {
        console.warn('[ProductContext] Blocked base64 image from being saved to Firestore. Using default image.');
        productData.images = ['/images/products/kurta-navy.png'];
      }

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), productData);
      console.log(`[ProductContext] Product saved to Firestore with ID: ${docRef.id}`);
      // No need to manually update state — onSnapshot will handle it automatically
    } catch (e) {
      console.error('[ProductContext] Failed to save product to Firestore:', e);
      throw e; // Re-throw so the caller knows it failed
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
