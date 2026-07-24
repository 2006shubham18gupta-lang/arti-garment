'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OfferBanner } from '@/types';
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

const BANNERS_COLLECTION = 'banners';

interface BannerContextType {
  banners: OfferBanner[];
  activeBanners: OfferBanner[];
  addBanner: (banner: Omit<OfferBanner, 'id' | 'createdAt'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<OfferBanner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string, currentStatus: boolean) => Promise<void>;
  isLoading: boolean;
}

const BannerContext = createContext<BannerContextType | null>(null);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for Firestore offer banners
  useEffect(() => {
    console.log('[BannerContext] Setting up Firestore onSnapshot listener for banners...');
    const q = query(collection(db, BANNERS_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedBanners: OfferBanner[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            ...data,
            id: data.originalId || docSnap.id,
            firestoreId: docSnap.id,
          } as OfferBanner;
        });

        console.log(`[BannerContext] Firestore banners received: ${loadedBanners.length}`);
        setBanners(loadedBanners);
        setIsLoading(false);
      },
      (error) => {
        console.error('[BannerContext] Firestore banners listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Automatically filter active & non-expired banners
  const activeBanners = banners.filter((b) => {
    if (!b.isActive) return false;
    // Check end date expiration if specified
    if (b.endDate) {
      const today = new Date().toISOString().split('T')[0];
      if (b.endDate < today) return false;
    }
    return true;
  });

  const addBanner = useCallback(async (bannerData: Omit<OfferBanner, 'id' | 'createdAt'>) => {
    try {
      const newBanner = {
        ...bannerData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, BANNERS_COLLECTION), newBanner);
      console.log(`[BannerContext] Banner added with ID: ${docRef.id}`);
    } catch (e) {
      console.error('[BannerContext] Failed to add banner:', e);
      throw e;
    }
  }, []);

  const updateBanner = useCallback(async (id: string, updates: Partial<OfferBanner>) => {
    const bannerToUpdate = banners.find((b) => b.id === id || b.firestoreId === id);
    if (!bannerToUpdate || !bannerToUpdate.firestoreId) {
      console.warn(`[BannerContext] Banner not found for update: ${id}`);
      return;
    }

    try {
      await updateDoc(doc(db, BANNERS_COLLECTION, bannerToUpdate.firestoreId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[BannerContext] Banner updated: ${bannerToUpdate.firestoreId}`);
    } catch (e) {
      console.error('[BannerContext] Failed to update banner:', e);
      throw e;
    }
  }, [banners]);

  const deleteBanner = useCallback(async (id: string) => {
    const bannerToDelete = banners.find((b) => b.id === id || b.firestoreId === id);
    if (!bannerToDelete || !bannerToDelete.firestoreId) {
      console.warn(`[BannerContext] Banner not found for deletion: ${id}`);
      return;
    }

    try {
      await deleteDoc(doc(db, BANNERS_COLLECTION, bannerToDelete.firestoreId));
      console.log(`[BannerContext] Banner deleted: ${bannerToDelete.firestoreId}`);
    } catch (e) {
      console.error('[BannerContext] Failed to delete banner:', e);
      throw e;
    }
  }, [banners]);

  const toggleBannerStatus = useCallback(async (id: string, currentStatus: boolean) => {
    await updateBanner(id, { isActive: !currentStatus });
  }, [updateBanner]);

  return (
    <BannerContext.Provider
      value={{
        banners,
        activeBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        isLoading,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
}
