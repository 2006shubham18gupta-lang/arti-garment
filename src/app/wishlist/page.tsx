'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store/StoreContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { state, dispatch } = useStore();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-surface-700">Wishlist</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900">
            Your Wishlist
          </h1>
          <p className="text-surface-500 mt-2">
            {state.wishlist.length} item{state.wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </motion.div>

        {state.wishlist.length > 0 ? (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  state.wishlist.forEach(item => dispatch({ type: 'TOGGLE_WISHLIST', payload: item.product }));
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {state.wishlist.map((item, i) => (
                <ProductCard key={item.product.id} product={item.product} index={i} />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-surface-50 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-surface-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-surface-400 mb-8">Start adding items you love!</p>
            <Link href="/" className="btn-primary inline-block">
              Explore Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
