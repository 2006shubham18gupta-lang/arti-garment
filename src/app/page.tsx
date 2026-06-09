'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';
import OfferBanner from '@/components/OfferBanner';
import { useProducts } from '@/store/ProductContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { allProducts, getTrendingProducts, getNewArrivals } = useProducts();
  const trending = getTrendingProducts();
  const newArrivals = getNewArrivals();

  return (
    <>
      <HeroSection />
      
      {/* Offer strip */}
      <div className="offer-banner py-3 text-center text-white text-sm font-medium tracking-wide">
        <motion.div
          animate={{ x: [0, -10, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="flex items-center justify-center gap-2"
        >
          <span>🎉</span>
          <span>FREE Delivery on orders above ₹999 | Use code ARTI40 for flat 40% off!</span>
          <span>🎉</span>
        </motion.div>
      </div>

      <CategorySection />

      <ProductSection
        tag="🔥 Hot Right Now"
        title="Trending Collection"
        subtitle="Most loved by our customers"
        products={trending}
        horizontal
      />

      <OfferBanner />

      <ProductSection
        tag="✨ Fresh Arrivals"
        title="New Arrivals"
        subtitle="Just landed — explore the latest designs"
        products={newArrivals}
      />

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-primary-500 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="section-heading mt-2">The Arti Garment Promise</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🏪', title: 'Trusted Store', desc: 'Serving Atarra since generations' },
              { icon: '✨', title: 'Premium Quality', desc: 'Finest fabrics & craftsmanship' },
              { icon: '💰', title: 'Best Prices', desc: 'Affordable luxury for everyone' },
              { icon: '🚚', title: 'Home Delivery', desc: 'Quick delivery across Banda' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white border border-surface-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-surface-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-surface-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <ProductSection
        tag="🛍️ Full Catalog"
        title="All Products"
        subtitle="Browse our complete collection"
        products={allProducts}
      />
    </>
  );
}
