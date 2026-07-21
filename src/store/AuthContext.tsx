'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

export interface UserAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface User {
  id: string;
  firestoreId?: string; // Firestore document ID
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address: UserAddress;
  createdAt: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  allUsers: User[];
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP'; payload: User }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_ADDRESS'; payload: UserAddress }
  | { type: 'LOAD_STATE'; payload: { user: User | null; allUsers: User[] } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  allUsers: [],
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SIGNUP': {
      const newUsers = [...state.allUsers, action.payload];
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        allUsers: newUsers,
      };
    }
    case 'UPDATE_PROFILE': {
      if (!state.user) return state;
      const updated = { ...state.user, ...action.payload };
      const updatedUsers = state.allUsers.map(u => u.id === updated.id ? updated : u);
      return {
        ...state,
        user: updated,
        allUsers: updatedUsers,
      };
    }
    case 'UPDATE_ADDRESS': {
      if (!state.user) return state;
      const updated = { ...state.user, address: action.payload };
      const updatedUsers = state.allUsers.map(u => u.id === updated.id ? updated : u);
      return {
        ...state,
        user: updated,
        allUsers: updatedUsers,
      };
    }
    case 'LOAD_STATE':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        allUsers: action.payload.allUsers,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const USERS_COLLECTION = 'users';

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateAddress: (address: UserAddress) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load all users from Firestore on mount + check for saved login session
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Load all users from Firestore
        const snapshot = await getDocs(collection(db, USERS_COLLECTION));
        const firestoreUsers: User[] = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id,
        })) as User[];

        // Check if there's a saved login session in localStorage (session only, not user data)
        let currentUser: User | null = null;
        try {
          const savedSession = localStorage.getItem('arti-session');
          if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            // Find the user in Firestore data to get latest info
            currentUser = firestoreUsers.find(u => u.id === sessionData.userId) || null;
          }
        } catch {
          // Session read failed, user just won't be logged in
        }

        // Migrate old localStorage users to Firestore (one-time)
        try {
          const oldUsers = localStorage.getItem('arti-users');
          if (oldUsers) {
            const localUsers: User[] = JSON.parse(oldUsers);
            for (const localUser of localUsers) {
              // Check if user already exists in Firestore
              const exists = firestoreUsers.some(
                u => u.email.toLowerCase() === localUser.email.toLowerCase()
              );
              if (!exists) {
                const { firestoreId, ...userData } = localUser as User & { firestoreId?: string };
                await addDoc(collection(db, USERS_COLLECTION), userData);
                firestoreUsers.push(localUser);
              }
            }
            // Clear old localStorage data
            localStorage.removeItem('arti-users');
            localStorage.removeItem('arti-current-user');
          }
        } catch {
          // Migration failed silently
        }

        dispatch({
          type: 'LOAD_STATE',
          payload: { user: currentUser, allUsers: firestoreUsers },
        });
      } catch (error) {
        console.error('Failed to load users from Firestore:', error);
        // Fallback to localStorage if Firestore fails
        try {
          const savedUsers = localStorage.getItem('arti-users');
          const savedCurrentUser = localStorage.getItem('arti-current-user');
          const allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
          const currentUser: User | null = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
          dispatch({
            type: 'LOAD_STATE',
            payload: { user: currentUser, allUsers },
          });
        } catch {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };
    loadUsers();
  }, []);

  // Save session to localStorage (only user ID, not full data)
  useEffect(() => {
    if (state.isLoading) return;
    try {
      if (state.user) {
        localStorage.setItem('arti-session', JSON.stringify({ userId: state.user.id }));
      } else {
        localStorage.removeItem('arti-session');
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [state.user, state.isLoading]);

  const login = async (email: string, password: string) => {
    try {
      // Fetch latest users from Firestore
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      const firestoreUsers: User[] = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        firestoreId: docSnap.id,
      })) as User[];

      const user = firestoreUsers.find(
        u => (u.email.toLowerCase() === email.toLowerCase() || u.phone === email) && u.password === password
      );

      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        // Update allUsers with latest data
        dispatch({ type: 'LOAD_STATE', payload: { user, allUsers: firestoreUsers } });
        return { success: true };
      }
      return { success: false, error: 'Invalid email/phone or password. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to local state
      const user = state.allUsers.find(
        u => (u.email.toLowerCase() === email.toLowerCase() || u.phone === email) && u.password === password
      );
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        return { success: true };
      }
      return { success: false, error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      // Check in Firestore if email already exists
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      const firestoreUsers: User[] = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        firestoreId: docSnap.id,
      })) as User[];

      const emailExists = firestoreUsers.some(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (emailExists) {
        return { success: false, error: 'This email is already registered. Please log in.' };
      }

      const phoneExists = firestoreUsers.some(u => u.phone === userData.phone);
      if (phoneExists) {
        return { success: false, error: 'This phone number is already registered. Please log in.' };
      }

      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...newUser,
      });

      newUser.firestoreId = docRef.id;

      dispatch({ type: 'SIGNUP', payload: newUser });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    try {
      localStorage.removeItem('arti-session');
    } catch {
      // Ignore
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });

    // Update in Firestore
    if (state.user?.firestoreId) {
      try {
        const userRef = doc(db, USERS_COLLECTION, state.user.firestoreId);
        await updateDoc(userRef, { ...data });
      } catch (e) {
        console.error('Failed to update profile in Firestore:', e);
      }
    }
  };

  const updateAddress = async (address: UserAddress) => {
    dispatch({ type: 'UPDATE_ADDRESS', payload: address });

    // Update in Firestore
    if (state.user?.firestoreId) {
      try {
        const userRef = doc(db, USERS_COLLECTION, state.user.firestoreId);
        await updateDoc(userRef, { address });
      } catch (e) {
        console.error('Failed to update address in Firestore:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, updateProfile, updateAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
