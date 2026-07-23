'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store/StoreContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { state, dispatch } = useStore();

  return (
    <div className="min-h-screen pt-28 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Wishlist</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-luxury font-bold text-white">
            Your Wishlist
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
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
                className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider transition-colors px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
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
            className="text-center py-24"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-luxury font-bold text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-slate-400 text-sm mb-8">Start adding items you love!</p>
            <Link href="/" className="btn-primary inline-flex rounded-2xl text-xs font-bold uppercase tracking-wider">
              Explore Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
