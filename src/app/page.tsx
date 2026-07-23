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

      {/* ─── ULTRA-ATTRACTIVE FEATURES SECTION WITH LIVE BACKGROUND ANIMATIONS ─── */}
      <section className="py-24 md:py-32 bg-slate-950/70 backdrop-blur-2xl border-y border-white/10 relative overflow-hidden">
        {/* Live Animated Background Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 90, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 blur-[130px] pointer-events-none z-0"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 right-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-800 blur-[140px] pointer-events-none z-0"
        />

        {/* Floating Geometric Sparkles / Live Floating Particle Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Title Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-amber-400/20 backdrop-blur-md">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-luxury text-white mt-4 tracking-tight">
              The <span className="text-gradient-gold">Arti Garment</span> Promise
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto mt-3 font-light">
              Delivering uncompromised craftsmanship, local heritage trust, and luxury shopping experience.
            </p>
          </motion.div>

          {/* Interactive Live Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: '🏪',
                title: 'Trusted Store',
                desc: 'Serving Atarra & Banda with pride for generations',
                badge: 'Legacy Trust',
                gradient: 'from-indigo-500/20 to-purple-600/10',
                borderHover: 'hover:border-indigo-400/60',
              },
              {
                icon: '✨',
                title: 'Premium Quality',
                desc: 'Finest handpicked fabrics & authentic embroidery',
                badge: '100% Authentic',
                gradient: 'from-pink-500/20 to-rose-600/10',
                borderHover: 'hover:border-pink-400/60',
              },
              {
                icon: '💰',
                title: 'Best Prices',
                desc: 'Affordable luxury pricing directly from craftsmen',
                badge: 'Direct Value',
                gradient: 'from-amber-500/20 to-yellow-600/10',
                borderHover: 'hover:border-amber-400/60',
              },
              {
                icon: '🚚',
                title: 'Home Delivery',
                desc: 'Express dispatch & safe delivery to your doorstep',
                badge: 'Fast & Secure',
                gradient: 'from-emerald-500/20 to-teal-600/10',
                borderHover: 'hover:border-emerald-400/60',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative p-8 rounded-3xl bg-gradient-to-b ${feature.gradient} glass-dark border border-white/10 ${feature.borderHover} transition-all duration-500 shadow-2xl group overflow-hidden`}
              >
                {/* Live Shimmer Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Floating Top Badge */}
                <div className="flex justify-between items-start mb-6">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300"
                  >
                    {feature.icon}
                  </motion.div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold text-amber-300 uppercase tracking-widest">
                    {feature.badge}
                  </span>
                </div>

                {/* Card Title & Desc */}
                <h3 className="font-luxury font-bold text-white text-xl mb-2 group-hover:text-amber-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {feature.desc}
                </p>

                {/* Bottom Glowing Bar */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                  <span className="uppercase tracking-wider">Verified Guarantee</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
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
