'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProductsByCategory, products } from '@/data/products';

const categoryInfo: Record<string, { title: string; description: string; image: string; gradient: string }> = {
  men: {
    title: "Men's Collection",
    description: 'Discover premium kurtas, sherwanis, and traditional wear crafted for the modern man.',
    image: '/images/categories/men.png',
    gradient: 'from-blue-900/90 to-indigo-900/80',
  },
  women: {
    title: "Women's Collection",
    description: 'Elegant sarees, lehengas, kurtis, and accessories for every occasion.',
    image: '/images/categories/women.png',
    gradient: 'from-pink-900/90 to-purple-900/80',
  },
  kids: {
    title: "Kids' Collection",
    description: 'Adorable traditional and modern wear for your little ones.',
    image: '/images/categories/kids.png',
    gradient: 'from-amber-900/90 to-orange-900/80',
  },
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const info = categoryInfo[category];
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);

  const categoryProducts = useMemo(() => {
    let filtered = getProductsByCategory(category);
    
    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered = filtered.filter(p => p.isNew).concat(filtered.filter(p => !p.isNew));
        break;
      default:
        break;
    }

    return filtered;
  }, [category, sortBy, priceRange]);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-surface-800 mb-4">Category Not Found</h1>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={info.image}
          alt={info.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${info.gradient}`} />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white">{info.title}</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
                {info.title}
              </h1>
              <p className="text-white/70 text-lg max-w-lg">
                {info.description}
              </p>
              <p className="text-white/50 text-sm mt-2">
                {categoryProducts.length} products found
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-surface-50 border border-surface-100"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-surface-500">Sort by:</span>
            {[
              { value: 'featured', label: 'Featured' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'rating', label: 'Top Rated' },
              { value: 'newest', label: 'Newest' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  sortBy === option.value
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-white text-surface-600 hover:bg-primary-50 border border-surface-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categoryProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-surface-700 mb-2">No products found</h3>
            <p className="text-surface-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
