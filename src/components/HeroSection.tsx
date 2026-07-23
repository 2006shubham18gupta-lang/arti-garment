'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const opacity = useTransform(scrollY, [0, 350], [1, 0]);
  const scale = useTransform(scrollY, [0, 350], [1, 1.08]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 25,
        y: (e.clientY / window.innerHeight - 0.5) * 25,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Background Image with Dynamic Parallax & Vignette */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img
          src="/images/banners/hero.png"
          alt="Arti Garment High Fashion Collection"
          className="w-full h-full object-cover object-center"
        />
        {/* Layered overlays for Apple/Zara level depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
      </motion.div>

      {/* Ambient Glass Floating Orbs */}
      <motion.div
        animate={{
          x: mousePos.x * 0.6,
          y: mousePos.y * 0.6,
        }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute top-24 right-1/4 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: mousePos.x * -0.4,
          y: mousePos.y * -0.4,
        }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute bottom-24 left-16 w-64 h-64 rounded-full bg-pink-600/15 blur-3xl pointer-events-none"
      />

      {/* Main Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 w-full">
        <div className="max-w-2xl">
          {/* Glass pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6 shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">
              Summer Festive Edit &apos;26
            </span>
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-luxury font-bold text-white leading-[1.08] tracking-tight"
          >
            Artistry <span className="italic font-light text-slate-300">in</span> Every{' '}
            <span className="relative inline-block text-gradient-gold font-bold">
              Detail
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-300/90 leading-relaxed font-light max-w-lg"
          >
            Handcrafted traditional & couture wear for Men, Women, and Kids.
            Experience timeless luxury fabrics designed in Atarra.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/category/women"
              className="group relative px-8 py-4 bg-white text-slate-950 font-semibold rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span className="relative z-10 text-sm tracking-wider uppercase">Explore Collection</span>
              <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/category/men"
              className="px-8 py-4 rounded-2xl border border-white/30 bg-white/5 backdrop-blur-md text-white text-sm tracking-wider uppercase font-semibold hover:bg-white/15 hover:border-white/60 transition-all duration-300 hover:-translate-y-0.5"
            >
              Men&apos;s Couture →
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { value: '500+', label: 'Design Catalog' },
              { value: '10K+', label: 'Happy Clients' },
              { value: '4.9★', label: 'Top Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-luxury font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Interactive Glass Card Accent */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="hidden lg:flex absolute bottom-16 right-16 z-20 p-4 rounded-3xl glass-dark border border-white/20 items-center gap-4 shadow-2xl max-w-xs"
      >
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
          <img src="/images/products/lehenga-red.png" alt="Featured" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Trending Now</span>
          <p className="text-xs font-semibold text-white truncate max-w-[150px]">Bridal Silk Lehenga</p>
          <p className="text-xs text-slate-300 font-bold mt-0.5">₹14,999</p>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-white" />
        </motion.div>
      </motion.div>
    </section>
  );
}
