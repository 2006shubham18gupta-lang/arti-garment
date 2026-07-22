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
  onSnapshot,
} from 'firebase/firestore';
import { Order, OrderItem, DeliveryAddress, OrderStatus } from '@/types';

interface OrderContextType {
  orders: Order[];           // Admin: all orders
  userOrders: Order[];       // User: only their own orders
  isLoading: boolean;
  userOrdersLoading: boolean;
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
  subscribeToUserOrders: (userId: string) => () => void; // returns unsubscribe fn
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);           // admin orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);   // user's own orders
  const [isLoading, setIsLoading] = useState(false);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  // ─── Place Order ───────────────────────────────────────────────────────────
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
      userId,       // MUST be user.id — used to query orders for this user
      userName,
      userEmail,
      items,
      deliveryAddress,
      paymentMethod: 'cod' as const,
      paymentStatus: 'pending' as const,
      status: 'pending' as OrderStatus,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log(`[OrderContext] Order placed with ID: ${docRef.id}, userId: ${userId}`);
      // NOTE: We do NOT manually update userOrders here.
      // The onSnapshot listener (subscribeToUserOrders) will pick it up automatically.
      return docRef.id;
    } catch (error: unknown) {
      console.error('[OrderContext] Error placing order:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        throw new Error('Firestore permission denied. Please check Firestore Rules.');
      }
      throw new Error('Order place karne mein problem hui: ' + msg);
    }
  }, []);

  // ─── Subscribe to User Orders (REAL-TIME) ──────────────────────────────────
  // Returns an unsubscribe function — call it in useEffect cleanup
  const subscribeToUserOrders = useCallback((userId: string) => {
    if (!userId) return () => {};

    setUserOrdersLoading(true);
    console.log(`[OrderContext] Setting up real-time listener for userId: ${userId}`);

    // Try with orderBy first (needs composite index)
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        console.log(`[OrderContext] Real-time: ${fetched.length} orders for user ${userId}`);
        setUserOrders(fetched);
        setUserOrdersLoading(false);
      },
      async (error) => {
        // If composite index is missing, fall back to simple query + client-side sort
        console.warn('[OrderContext] Composite query failed, falling back:', error.message);
        try {
          const simpleQ = query(
            collection(db, 'orders'),
            where('userId', '==', userId)
          );
          const fallbackUnsub = onSnapshot(simpleQ, (snap) => {
            const fetched: Order[] = snap.docs.map(d => ({
              id: d.id,
              ...d.data(),
            })) as Order[];
            fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            console.log(`[OrderContext] Fallback: ${fetched.length} orders for user ${userId}`);
            setUserOrders(fetched);
            setUserOrdersLoading(false);
          });
          // Return the fallback unsubscribe — the outer one is already invalid
          return fallbackUnsub;
        } catch (fallbackErr) {
          console.error('[OrderContext] Fallback also failed:', fallbackErr);
          setUserOrdersLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ─── Fetch User Orders (one-time, kept for compatibility) ──────────────────
  const fetchUserOrders = useCallback(async (userId: string) => {
    setUserOrdersLoading(true);
    try {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetched: Order[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Order[];
        setUserOrders(fetched);
      } catch {
        // Fallback without orderBy
        const snapshot = await getDocs(collection(db, 'orders'));
        const fetched = (snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[])
          .filter(o => o.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserOrders(fetched);
      }
    } catch (error) {
      console.error('[OrderContext] fetchUserOrders error:', error);
    } finally {
      setUserOrdersLoading(false);
    }
  }, []);

  // ─── Fetch All Orders (Admin, one-time) ────────────────────────────────────
  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetched: Order[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Order[];
        setOrders(fetched);
      } catch {
        const snapshot = await getDocs(collection(db, 'orders'));
        const fetched = (snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetched);
      }
    } catch (error) {
      console.error('[OrderContext] fetchAllOrders error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Update Order Status (Admin) ───────────────────────────────────────────
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
      if (rejectionReason) updateData.rejectionReason = rejectionReason;
      await updateDoc(orderRef, updateData);

      // Update admin orders state
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, status, rejectionReason, updatedAt: updateData.updatedAt }
            : o
        )
      );
      // Also update userOrders if present
      setUserOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, status, rejectionReason, updatedAt: updateData.updatedAt }
            : o
        )
      );
    } catch (error) {
      console.error('[OrderContext] updateOrderStatus error:', error);
      throw new Error('Order update karne mein problem hui.');
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        userOrders,
        isLoading,
        userOrdersLoading,
        placeOrder,
        fetchAllOrders,
        fetchUserOrders,
        subscribeToUserOrders,
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
