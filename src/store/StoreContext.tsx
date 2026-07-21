'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { Product, CartItem, WishlistItem } from '@/types';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

interface StoreState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  searchQuery: string;
  isSearchOpen: boolean;
  isCartOpen: boolean;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: { product: Product; size: string; color: string } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QTY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: Product }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_SEARCH'; payload?: boolean }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<StoreState> };

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  searchQuery: '',
  isSearchOpen: false,
  isCartOpen: false,
};

function storeReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, color } = action.payload;
      const existingIndex = state.cart.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1,
        };
        return { ...state, cart: newCart };
      }
      return {
        ...state,
        cart: [...state.cart, { product, quantity: 1, selectedSize: size, selectedColor: color }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload),
      };
    case 'UPDATE_CART_QTY': {
      const { id, qty } = action.payload;
      if (qty <= 0) {
        return { ...state, cart: state.cart.filter(item => item.product.id !== id) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === id ? { ...item, quantity: qty } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find(item => item.product.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          wishlist: state.wishlist.filter(item => item.product.id !== action.payload.id),
        };
      }
      return {
        ...state,
        wishlist: [...state.wishlist, { product: action.payload, addedAt: new Date() }],
      };
    }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_SEARCH':
      return { ...state, isSearchOpen: action.payload ?? !state.isSearchOpen };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: action.payload ?? !state.isCartOpen };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Helper: get userId from session
function getSessionUserId(): string | null {
  try {
    const session = localStorage.getItem('arti-session');
    if (session) {
      return JSON.parse(session).userId || null;
    }
  } catch {
    // ignore
  }
  return null;
}

const CART_COLLECTION = 'user_carts';

const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  cartTotal: number;
  cartCount: number;
  isInWishlist: (id: string) => boolean;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const isLoaded = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load cart/wishlist from Firestore (user-specific) or localStorage (guest)
  useEffect(() => {
    const loadStore = async () => {
      const userId = getSessionUserId();

      if (userId) {
        // Logged-in user: load from Firestore
        try {
          const cartDoc = await getDoc(doc(db, CART_COLLECTION, userId));
          if (cartDoc.exists()) {
            const data = cartDoc.data();
            dispatch({
              type: 'LOAD_STATE',
              payload: {
                ...(data.cart ? { cart: data.cart } : {}),
                ...(data.wishlist ? { wishlist: data.wishlist } : {}),
              },
            });
            isLoaded.current = true;
            return;
          }
        } catch (e) {
          console.error('Failed to load cart from Firestore:', e);
        }
      }

      // Guest or Firestore failed: load from localStorage
      try {
        const savedCart = localStorage.getItem('arti-cart');
        const savedWishlist = localStorage.getItem('arti-wishlist');
        if (savedCart || savedWishlist) {
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...(savedCart ? { cart: JSON.parse(savedCart) } : {}),
              ...(savedWishlist ? { wishlist: JSON.parse(savedWishlist) } : {}),
            },
          });
        }
      } catch (e) {
        console.error('Failed to load store state:', e);
      }
      isLoaded.current = true;
    };
    loadStore();
  }, []);

  // Save cart/wishlist to Firestore (user-specific) + localStorage (fallback)
  useEffect(() => {
    if (!isLoaded.current) return;

    // Always save to localStorage as fallback
    try {
      localStorage.setItem('arti-cart', JSON.stringify(state.cart));
      localStorage.setItem('arti-wishlist', JSON.stringify(state.wishlist));
    } catch (e) {
      console.error('Failed to save store state to localStorage:', e);
    }

    // Debounced save to Firestore for logged-in users
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(async () => {
      const userId = getSessionUserId();
      if (userId) {
        try {
          await setDoc(doc(db, CART_COLLECTION, userId), {
            cart: state.cart,
            wishlist: state.wishlist,
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error('Failed to save cart to Firestore:', e);
        }
      }
    }, 1000); // 1 second debounce to avoid too many writes

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state.cart, state.wishlist]);

  const cartTotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const isInWishlist = (id: string) => state.wishlist.some(item => item.product.id === id);

  return (
    <StoreContext.Provider value={{ state, dispatch, cartTotal, cartCount, isInWishlist }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
