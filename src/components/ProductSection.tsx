'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  tag: string;
  products: Product[];
  horizontal?: boolean;
}

export default function ProductSection({ title, subtitle, tag, products, horizontal = false }: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-sm font-semibold text-primary-500 uppercase tracking-widest">{tag}</span>
            <h2 className="section-heading mt-2">{title}</h2>
            <p className="section-subheading">{subtitle}</p>
          </div>
          {horizontal && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-surface-200 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-surface-200 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* Products */}
        {horizontal ? (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x snap-mandatory -mx-4 px-4"
          >
            {products.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-72 snap-start">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
