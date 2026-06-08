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
    gradient: 'from-blue-600/80 to-indigo-800/80',
    items: '200+',
  },
  {
    id: 'women',
    name: 'Women',
    description: 'Sarees, Lehengas & Kurtis',
    image: '/images/categories/women.png',
    gradient: 'from-pink-500/80 to-purple-700/80',
    items: '250+',
  },
  {
    id: 'kids',
    name: 'Kids',
    description: 'Traditional & Modern Wear',
    image: '/images/categories/kids.png',
    gradient: 'from-amber-500/80 to-orange-600/80',
    items: '100+',
  },
];

export default function CategorySection() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-primary-500 uppercase tracking-widest">Browse By</span>
          <h2 className="section-heading mt-2">Shop by Category</h2>
          <p className="section-subheading max-w-lg mx-auto">
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
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden perspective-1000">
                  {/* Image */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: 3 }}
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
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3">
                        {cat.items} Products
                      </span>
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-white/80 text-sm">{cat.description}</p>

                      <div className="mt-4 flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                        <span>Explore Collection</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/5 to-transparent" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
