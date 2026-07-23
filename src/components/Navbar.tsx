'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { useProducts } from '@/store/ProductContext';
import { Product } from '@/types';

export default function Navbar() {
  const { state, dispatch, cartCount } = useStore();
  const { state: authState } = useAuth();
  const { searchProducts } = useProducts();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        dispatch({ type: 'TOGGLE_SEARCH', payload: false });
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleSearch = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    if (query.length > 1) {
      setSearchResults(searchProducts(query));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-white/80 backdrop-blur-2xl shadow-sm border-b border-slate-100'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center text-white font-luxury font-bold text-xl group-hover:scale-105 transition-transform duration-300 shadow-md">
                  A
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <h1 className="text-xl font-luxury font-bold tracking-wider text-slate-900 uppercase">
                  ARTI <span className="text-indigo-600 font-light italic">Garment</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase -mt-1">
                  ATARRA • BANDA
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50">
              {[
                { name: 'Home', href: '/' },
                { name: 'Men', href: '/category/men' },
                { name: 'Women', href: '/category/women' },
                { name: 'Kids', href: '/category/kids' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Trigger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
                className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors duration-200"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>

              {/* Wishlist Icon */}
              <Link href="/wishlist">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {state.wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md"
                    >
                      {state.wishlist.length}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Cart Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="relative p-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors duration-200"
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4.5 h-4.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Account Menu - Desktop */}
              <div className="hidden md:block relative" ref={userMenuRef}>
                {authState.isAuthenticated && authState.user ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {authState.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                      {authState.user.fullName.split(' ')[0]}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
                  >
                    Login
                  </Link>
                )}

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && authState.isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
                    >
                      <div className="p-3 bg-slate-50 rounded-2xl mb-1">
                        <p className="text-xs font-bold text-slate-900">{authState.user?.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{authState.user?.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <span>👤</span> My Profile
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <span>❤️</span> Wishlist ({state.wishlist.length})
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <span>📦</span> My Orders
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Modal Overlay */}
        <AnimatePresence>
          {state.isSearchOpen && (
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-2xl border-t border-slate-100 z-50"
            >
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search kurtas, sarees, lehengas..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 text-base bg-slate-100/70 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => dispatch({ type: 'TOGGLE_SEARCH', payload: false })}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400">{product.subcategory} • {product.category}</p>
                        </div>
                        <p className="font-bold text-sm text-indigo-600">₹{product.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {state.searchQuery.length > 1 && searchResults.length === 0 && (
                  <p className="text-center text-slate-400 text-sm mt-4 py-2">
                    No products matching &quot;{state.searchQuery}&quot;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Men', href: '/category/men' },
                  { name: 'Women', href: '/category/women' },
                  { name: 'Kids', href: '/category/kids' },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-100 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-slate-100 pt-3 mt-3">
                  {authState.isAuthenticated && authState.user ? (
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-100 text-sm transition-colors"
                    >
                      👤 My Profile ({authState.user.fullName})
                    </Link>
                  ) : (
                    <div className="flex gap-2 px-2 pt-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 py-3 text-center rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 py-3 text-center rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Cart Drawer */}
      <CartSidebar />
    </>
  );
}

function CartSidebar() {
  const { state, dispatch, cartTotal, cartCount } = useStore();

  return (
    <AnimatePresence>
      {state.isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold font-luxury text-slate-900">Shopping Cart</h2>
                <p className="text-xs text-slate-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
              {state.cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Explore our collection to add items</p>
                </div>
              ) : (
                state.cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100"
                  >
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-xs text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Size: {item.selectedSize}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-0.5">
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_CART_QTY', payload: { id: item.product.id, qty: item.quantity - 1 } })}
                            className="text-slate-500 hover:text-indigo-600 text-xs"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_CART_QTY', payload: { id: item.product.id, qty: item.quantity + 1 } })}
                            className="text-slate-500 hover:text-indigo-600 text-xs"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-xs text-indigo-600">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id })}
                      className="self-start text-slate-300 hover:text-rose-500 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {state.cart.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-5 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Subtotal</span>
                  <span className="text-lg font-bold text-slate-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
                  className="block w-full btn-primary text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Checkout Now
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
