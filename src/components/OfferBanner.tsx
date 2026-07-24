'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useBanners } from '@/store/BannerContext';

export default function OfferBanner() {
  const { activeBanners } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slider if multiple active banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Fallback banner if no active banner is added in Firestore yet
  const defaultBanner = {
    id: 'default-banner',
    title: 'Flat 40% Off on Festive & Wedding Collection',
    subtitle: 'Premium Sherwanis, Lehengas & Sarees at unbeatable prices',
    discount: '40% OFF',
    buttonText: 'Shop Collection',
    buttonLink: '/category/women',
    imageUrl: '',
  };

  const bannersToDisplay = activeBanners.length > 0 ? activeBanners : [defaultBanner];
  const currentBanner = bannersToDisplay[currentIndex] || bannersToDisplay[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannersToDisplay.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannersToDisplay.length) % bannersToDisplay.length);
  };

  return (
    <section className="py-10 md:py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl p-8 md:p-14 border border-white/10 shadow-2xl min-h-[220px] flex items-center"
              style={{
                background: currentBanner.imageUrl
                  ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${currentBanner.imageUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)',
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

              {/* Glow Orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-amber-300 mb-4 uppercase tracking-wider">
                    🎉 {currentBanner.discount || 'Special Offer'}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-luxury font-bold text-white mb-3 tracking-tight leading-tight">
                    {currentBanner.title}
                  </h3>
                  {currentBanner.subtitle && (
                    <p className="text-slate-200 text-sm md:text-base font-light leading-relaxed">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
                  <Link
                    href={currentBanner.buttonLink || '/category/men'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-2xl hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 text-xs uppercase tracking-wider"
                  >
                    {currentBanner.buttonText || 'Explore Now'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls (Shown if multiple banners exist) */}
          {bannersToDisplay.length > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                {bannersToDisplay.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/20'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                  aria-label="Previous banner"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                  aria-label="Next banner"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
