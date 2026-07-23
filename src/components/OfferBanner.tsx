'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OfferBanner() {
  return (
    <section className="py-10 md:py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-14 border border-white/10 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)',
          }}
        >
          {/* Live Animated Floating Shapes */}
          <motion.div
            animate={{ y: [-12, 12, -12], rotate: [0, 45, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 right-10 w-20 h-20 bg-white/10 rounded-3xl hidden md:block"
          />
          <motion.div
            animate={{ y: [10, -10, 10], scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-6 right-28 w-12 h-12 bg-white/10 rounded-full hidden md:block"
          />
          <motion.div
            animate={{ x: [-5, 5, -5], rotate: [0, -30, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 right-1/4 w-8 h-8 bg-amber-400/15 rounded-xl hidden lg:block"
          />

          {/* Glow Orb */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white mb-4 uppercase tracking-wider">
                  🎉 Limited Time Offer
                </span>
                <h3 className="text-3xl md:text-4xl font-luxury font-bold text-white mb-2 tracking-tight">
                  Flat 40% Off on Wedding Collection
                </h3>
                <p className="text-white/60 text-sm md:text-base font-light">
                  Premium Sherwanis, Lehengas & Sarees at unbeatable prices
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/category/women"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:shadow-2xl hover:shadow-black/25 hover:-translate-y-1 transition-all duration-300 flex-shrink-0 text-sm uppercase tracking-wider"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
