'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

// Floating sparkle particles component
const Particles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-200/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.9, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 140]);
  const opacity = useTransform(scrollY, [0, 380], [1, 0]);
  const scale = useTransform(scrollY, [0, 380], [1, 1.1]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Dynamic Background Image with Parallax & Vignette */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img
          src="/images/banners/hero.png"
          alt="Arti Garment High Fashion Collection"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        {/* Apple / Zara Level Multi-Layer Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      </motion.div>

      {/* Floating Gold Sparkle Particles */}
      <Particles />

      {/* Ambient Glass Floating Orbs with Mouse Motion */}
      <motion.div
        animate={{
          x: mousePos.x * 0.8,
          y: mousePos.y * 0.8,
          scale: [1, 1.15, 1],
        }}
        transition={{
          x: { type: 'spring', damping: 25 },
          y: { type: 'spring', damping: 25 },
          scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute top-20 right-1/3 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none z-[1]"
      />
      <motion.div
        animate={{
          x: mousePos.x * -0.6,
          y: mousePos.y * -0.6,
          scale: [1, 1.2, 1],
        }}
        transition={{
          x: { type: 'spring', damping: 25 },
          y: { type: 'spring', damping: 25 },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute bottom-20 left-12 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none z-[1]"
      />

      {/* Floating Glass Feature Badges (Interactive Parallax Elements) */}
      <motion.div
        animate={{
          x: mousePos.x * -0.5,
          y: mousePos.y * -0.5 + Math.sin(Date.now() / 1000) * 8,
        }}
        transition={{ type: 'spring', damping: 20 }}
        className="hidden lg:flex absolute top-36 right-16 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white pointer-events-none"
      >
        <span className="text-xl">✨</span>
        <div>
          <p className="text-xs font-bold font-luxury tracking-wide">Pure Handcrafted Silk</p>
          <p className="text-[10px] text-amber-300 font-semibold uppercase">100% Authentic Atarra Craft</p>
        </div>
      </motion.div>

      <motion.div
        animate={{
          x: mousePos.x * 0.4,
          y: mousePos.y * 0.4 - Math.sin(Date.now() / 1000) * 8,
        }}
        transition={{ type: 'spring', damping: 20 }}
        className="hidden lg:flex absolute bottom-36 right-32 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white pointer-events-none"
      >
        <span className="text-xl">👑</span>
        <div>
          <p className="text-xs font-bold font-luxury tracking-wide">Festive & Bridal Edit</p>
          <p className="text-[10px] text-emerald-300 font-semibold uppercase">New Arrival 2026</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 w-full">
        <div className="max-w-2xl">
          {/* Animated Glass Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-2xl hover:border-amber-400/40 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-xs font-semibold text-white/95 uppercase tracking-widest">
              Festive Couture Edit &apos;26
            </span>
          </motion.div>

          {/* Editorial Animated Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-luxury font-bold text-white leading-[1.05] tracking-tight"
          >
            Artistry <span className="italic font-light text-slate-300">in</span> Every{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-bold">
              Detail
              <motion.div
                className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-300/90 leading-relaxed font-light max-w-lg"
          >
            Handcrafted traditional &amp; couture wear for Men, Women, and Kids.
            Experience timeless luxury fabrics designed in Atarra.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/category/women"
              className="group relative px-8 py-4 bg-gradient-to-r from-white via-amber-50 to-white text-slate-950 font-bold rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:-translate-y-1 flex items-center gap-2.5"
            >
              <span className="relative z-10 text-xs sm:text-sm tracking-wider uppercase font-luxury">Explore Collection</span>
              <motion.svg
                className="w-4 h-4 relative z-10 text-slate-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </motion.svg>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/category/men"
              className="px-8 py-4 rounded-2xl border border-white/25 bg-white/5 backdrop-blur-md text-white text-xs sm:text-sm tracking-wider uppercase font-bold hover:bg-white/15 hover:border-white/60 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              Men&apos;s Couture →
            </Link>
          </motion.div>

          {/* Social Proof Stats with Animated Counters */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { value: '500+', label: 'Design Catalog', icon: '✨' },
              { value: '10K+', label: 'Happy Clients', icon: '❤️' },
              { value: '4.9★', label: 'Top Rating', icon: '⭐' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="space-y-0.5"
              >
                <p className="text-2xl sm:text-3xl font-luxury font-bold text-white tracking-tight flex items-center gap-1">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5 backdrop-blur-sm"
        >
          <div className="w-1 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

