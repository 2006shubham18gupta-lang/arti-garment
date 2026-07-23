'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const categories = [
  {
    id: 'men',
    name: 'Men',
    description: 'Kurtas, Sherwanis & More',
    image: '/images/categories/men.png',
    gradient: 'from-indigo-900/90 via-indigo-950/80 to-slate-950/90',
    items: '200+',
  },
  {
    id: 'women',
    name: 'Women',
    description: 'Sarees, Lehengas & Kurtis',
    image: '/images/categories/women.png',
    gradient: 'from-pink-900/90 via-purple-950/80 to-slate-950/90',
    items: '250+',
  },
  {
    id: 'kids',
    name: 'Kids',
    description: 'Traditional & Modern Wear',
    image: '/images/categories/kids.png',
    gradient: 'from-amber-900/90 via-orange-950/80 to-slate-950/90',
    items: '100+',
  },
];

export default function CategorySection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-slate-950/40 backdrop-blur-xl border-y border-white/5">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Browse By</span>
          <h2 className="text-3xl md:text-5xl font-bold font-luxury tracking-tight text-white mt-2">Shop by Category</h2>
          <p className="text-slate-400 text-sm md:text-base font-light mt-3 max-w-lg mx-auto">
            Find the perfect outfit for every occasion — from weddings to casual wear
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <Link href={`/category/${cat.id}`} className="group block">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Image */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </motion.div>

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-75 group-hover:opacity-85 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md border border-white/15 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-3">
                        {cat.items} Products
                      </span>
                      <h3 className="text-3xl md:text-4xl font-luxury font-bold text-white mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-white/80 text-xs font-light">{cat.description}</p>

                      <div className="mt-4 flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider group-hover:gap-4 transition-all duration-300">
                        <span>Explore Collection</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
