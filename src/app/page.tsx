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
      <div className="offer-banner py-3.5 text-center text-white text-xs md:text-sm font-bold tracking-wider uppercase border-y border-white/10">
        <motion.div
          animate={{ x: [0, -8, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>FREE Delivery on orders above ₹999 | Use code <span className="text-amber-300 font-extrabold underline">ARTI40</span> for flat 40% off!</span>
          <span>✨</span>
        </motion.div>
      </div>

      <CategorySection />

      <ProductSection
        tag="🔥 Hot Right Now"
        title="Trending Collection"
        subtitle="Most loved by our customers in Atarra & Banda"
        products={trending}
        horizontal
      />

      <OfferBanner />

      <ProductSection
        tag="✨ Fresh Arrivals"
        title="New Arrivals"
        subtitle="Just landed — explore the latest handcrafted designs"
        products={newArrivals}
      />

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-slate-950/50 backdrop-blur-xl border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold font-luxury text-white mt-2">The Arti Garment Promise</h2>
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
                className="text-center p-6 md:p-8 rounded-3xl glass-dark border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group shadow-xl"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-luxury font-bold text-white text-base md:text-lg mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400 font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <ProductSection
        tag="🛍️ Full Catalog"
        title="All Products"
        subtitle="Browse our complete traditional & modern collection"
        products={allProducts}
      />
    </>
  );
}
