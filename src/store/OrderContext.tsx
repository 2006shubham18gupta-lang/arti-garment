'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { Order, OrderItem, DeliveryAddress, OrderStatus } from '@/types';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (
    items: OrderItem[],
    deliveryAddress: DeliveryAddress,
    totalAmount: number,
    userId: string,
    userName: string,
    userEmail: string
  ) => Promise<string>;
  fetchAllOrders: () => Promise<void>;
  fetchUserOrders: (userId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Place a new order
  const placeOrder = useCallback(async (
    items: OrderItem[],
    deliveryAddress: DeliveryAddress,
    totalAmount: number,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<string> => {
    const now = new Date().toISOString();
    const orderData = {
      userId,
      userName,
      userEmail,
      items,
      deliveryAddress,
      paymentMethod: 'cod' as const,
      status: 'pending' as OrderStatus,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      const newOrder: Order = {
        id: docRef.id,
        ...orderData,
      };

      setOrders(prev => [newOrder, ...prev]);
      return docRef.id;
    } catch (error: unknown) {
      console.error('Error placing order:', error);

      // Check if it's a Firestore permission error
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('permission') || errorMessage.includes('PERMISSION_DENIED')) {
        throw new Error(
          'Firestore permission denied. Firebase Console mein jaake Firestore Rules update karein:\n' +
          'rules_version = "2";\n' +
          'service cloud.firestore {\n' +
          '  match /databases/{database}/documents {\n' +
          '    match /{document=**} {\n' +
          '      allow read, write: if true;\n' +
          '    }\n' +
          '  }\n' +
          '}'
        );
      }

      throw new Error('Order place karne mein problem hui: ' + errorMessage);
    }
  }, []);

  // Fetch all orders (for admin)
  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try with orderBy first
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (indexError: unknown) {
        // If orderBy fails due to missing index, fetch without ordering
        console.warn('OrderBy failed (may need Firestore index), fetching without order:', indexError);
        const snapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        // Sort client-side instead
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch orders for a specific user
  const fetchUserOrders = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // Try with where + orderBy
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (indexError: unknown) {
        // If composite index is missing, fetch all and filter client-side
        console.warn('Composite query failed (may need Firestore index), fetching all and filtering:', indexError);
        const snapshot = await getDocs(collection(db, 'orders'));
        const allOrders: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        const fetchedOrders = allOrders
          .filter(o => o.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update order status (admin)
  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: OrderStatus,
    rejectionReason?: string
  ) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: Record<string, string> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      await updateDoc(orderRef, updateData);

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status, rejectionReason, updatedAt: updateData.updatedAt }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Order update karne mein problem hui.');
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        placeOrder,
        fetchAllOrders,
        fetchUserOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
