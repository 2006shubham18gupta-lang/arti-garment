'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useBanners } from '@/store/BannerContext';

export default function OfferBanner() {
  const { activeBanners, isLoading } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slider if multiple active banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (isLoading) {
    return (
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-56 rounded-3xl bg-slate-900/60 border border-white/10 animate-pulse flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Loading Banners from Firestore...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (activeBanners.length === 0) {
    return null; // Gracefully hide if no active banners exist in Firestore
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <section className="py-8 md:py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentBanner.firestoreId || currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-3xl p-8 md:p-14 border border-white/15 shadow-2xl min-h-[240px] flex items-center"
              style={{
                background: currentBanner.imageUrl
                  ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${currentBanner.imageUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)',
              }}
            >
              {/* Responsive Mobile Image Override if present */}
              {currentBanner.mobileImageUrl && (
                <style jsx>{`
                  @media (max-width: 640px) {
                    div {
                      background: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url(${currentBanner.mobileImageUrl}) center/cover no-repeat !important;
                    }
                  }
                `}</style>
              )}

              {/* Floating Ambient Animation */}
              <motion.div
                animate={{ y: [-10, 10, -10], rotate: [0, 45, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-6 right-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl hidden md:block pointer-events-none"
              />
              <motion.div
                animate={{ y: [10, -10, 10], scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-6 right-32 w-14 h-14 bg-amber-400/20 rounded-full hidden md:block pointer-events-none"
              />

              {/* Glow Orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="max-w-2xl space-y-3">
                  {currentBanner.discount && (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 backdrop-blur-md border border-amber-400/40 rounded-full text-xs font-bold text-amber-300 uppercase tracking-wider shadow-lg">
                      🎉 {currentBanner.discount}
                    </span>
                  )}
                  <h3 className="text-3xl md:text-5xl font-luxury font-bold text-white tracking-tight leading-tight">
                    {currentBanner.title}
                  </h3>
                  {currentBanner.subtitle && (
                    <p className="text-slate-200 text-sm md:text-base font-light leading-relaxed">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.description && (
                    <p className="text-slate-300 text-xs md:text-sm font-normal line-clamp-2">
                      {currentBanner.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 pt-2 md:pt-0">
                  <Link
                    href={currentBanner.buttonLink || '/category/women'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-2xl hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 transition-all duration-300 text-xs uppercase tracking-wider shadow-xl"
                  >
                    {currentBanner.buttonText || 'Shop Now'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Slider Navigation Controls */}
          {activeBanners.length > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                {activeBanners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg"
                  aria-label="Previous banner"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg"
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
