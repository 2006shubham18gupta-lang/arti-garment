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
  Timestamp,
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
    try {
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

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const newOrder: Order = {
        id: docRef.id,
        ...orderData,
      };

      setOrders(prev => [newOrder, ...prev]);
      return docRef.id;
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error('Order place karne mein problem hui. Please try again.');
    }
  }, []);

  // Fetch all orders (for admin)
  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(fetchedOrders);
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
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(fetchedOrders);
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
