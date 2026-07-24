'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OfferBanner } from '@/types';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const BANNERS_COLLECTION = 'offerBanners';

export const uploadBannerImageToStorage = (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `offerBanners/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('[Firebase Storage] Banner upload failed:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('[Firebase Storage] Banner upload complete:', downloadUrl);
        resolve(downloadUrl);
      }
    );
  });
};

export const deleteBannerImageFromStorage = async (url?: string) => {
  if (!url) return;
  if (url.includes('firebasestorage.googleapis.com') || url.includes('appspot.com')) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      console.log('[Firebase Storage] Successfully deleted banner image file.');
    } catch (e) {
      console.warn('[Firebase Storage] Note on image deletion (file may already be missing):', e);
    }
  }
};

interface BannerContextType {
  banners: OfferBanner[];
  activeBanners: OfferBanner[];
  isLoading: boolean;
  addBanner: (banner: Omit<OfferBanner, 'id' | 'createdAt'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<OfferBanner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string, currentStatus: boolean) => Promise<void>;
  uploadImageWithProgress: (file: File, onProgress?: (progress: number) => void) => Promise<string>;
  reorderBanner: (id: string, newPriority: number) => Promise<void>;
}

const BannerContext = createContext<BannerContextType | null>(null);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Firestore onSnapshot listener for "offerBanners" collection
  useEffect(() => {
    console.log('[BannerContext] Initializing onSnapshot listener on "offerBanners"...');
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
            priority: Number(data.priority) || 1,
            isActive: Boolean(data.isActive),
          } as OfferBanner;
        });

        // Sort by priority ascending (1, 2, 3...)
        loadedBanners.sort((a, b) => (a.priority || 1) - (b.priority || 1));

        console.log(`[BannerContext] Received ${loadedBanners.length} banners from Firestore "offerBanners"`);
        setBanners(loadedBanners);
        setIsLoading(false);
      },
      (error) => {
        console.error('[BannerContext] Firestore "offerBanners" listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter active & scheduled (non-expired) banners automatically
  const activeBanners = banners.filter((b) => {
    if (!b.isActive) return false;
    const today = new Date().toISOString().split('T')[0];
    if (b.startDate && b.startDate > today) return false;
    if (b.endDate && b.endDate < today) return false;
    return true;
  });

  const addBanner = useCallback(async (bannerData: Omit<OfferBanner, 'id' | 'createdAt'>) => {
    try {
      const now = new Date().toISOString();
      const newBanner = {
        ...bannerData,
        priority: Number(bannerData.priority) || (banners.length + 1),
        isActive: bannerData.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, BANNERS_COLLECTION), newBanner);
      console.log(`[BannerContext] Created banner in "offerBanners" ID: ${docRef.id}`);
    } catch (e) {
      console.error('[BannerContext] Failed to add banner:', e);
      throw e;
    }
  }, [banners.length]);

  const updateBanner = useCallback(async (id: string, updates: Partial<OfferBanner>) => {
    const bannerToUpdate = banners.find((b) => b.id === id || b.firestoreId === id);
    if (!bannerToUpdate || !bannerToUpdate.firestoreId) {
      console.warn(`[BannerContext] Banner not found for update: ${id}`);
      return;
    }

    try {
      const docRef = doc(db, BANNERS_COLLECTION, bannerToUpdate.firestoreId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[BannerContext] Banner updated ID: ${bannerToUpdate.firestoreId}`);
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
      // Requirement 10: Delete banner images from Firebase Storage when banner is deleted
      if (bannerToDelete.imageUrl) {
        await deleteBannerImageFromStorage(bannerToDelete.imageUrl);
      }
      if (bannerToDelete.mobileImageUrl) {
        await deleteBannerImageFromStorage(bannerToDelete.mobileImageUrl);
      }

      await deleteDoc(doc(db, BANNERS_COLLECTION, bannerToDelete.firestoreId));
      console.log(`[BannerContext] Deleted banner & storage files for ID: ${bannerToDelete.firestoreId}`);
    } catch (e) {
      console.error('[BannerContext] Failed to delete banner:', e);
      throw e;
    }
  }, [banners]);

  const toggleBannerStatus = useCallback(async (id: string, currentStatus: boolean) => {
    await updateBanner(id, { isActive: !currentStatus });
  }, [updateBanner]);

  const reorderBanner = useCallback(async (id: string, newPriority: number) => {
    await updateBanner(id, { priority: newPriority });
  }, [updateBanner]);

  const uploadImageWithProgress = useCallback(async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return uploadBannerImageToStorage(file, onProgress);
  }, []);

  return (
    <BannerContext.Provider
      value={{
        banners,
        activeBanners,
        isLoading,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        uploadImageWithProgress,
        reorderBanner,
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
