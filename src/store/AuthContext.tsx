'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

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

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateAddress: (address: UserAddress) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (state.isLoading) return;
    try {
      localStorage.setItem('arti-users', JSON.stringify(state.allUsers));
      if (state.user) {
        localStorage.setItem('arti-current-user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('arti-current-user');
      }
    } catch (e) {
      console.error('Failed to save auth state:', e);
    }
  }, [state.allUsers, state.user, state.isLoading]);

  const login = (email: string, password: string) => {
    const user = state.allUsers.find(
      u => (u.email.toLowerCase() === email.toLowerCase() || u.phone === email) && u.password === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return { success: true };
    }
    return { success: false, error: 'Invalid email/phone or password. Please try again.' };
  };

  const signup = (userData: Omit<User, 'id' | 'createdAt'>) => {
    // Check if email already exists
    const emailExists = state.allUsers.some(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (emailExists) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }

    // Check if phone already exists
    const phoneExists = state.allUsers.some(u => u.phone === userData.phone);
    if (phoneExists) {
      return { success: false, error: 'This phone number is already registered. Please log in.' };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'SIGNUP', payload: newUser });
    return { success: true };
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  };

  const updateAddress = (address: UserAddress) => {
    dispatch({ type: 'UPDATE_ADDRESS', payload: address });
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
