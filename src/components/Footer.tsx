'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden pt-20 pb-12 border-t border-slate-800/80">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Newsletter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-12 rounded-3xl glass-dark border border-white/10 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Join The Privilege Club</span>
            <h3 className="text-2xl md:text-3xl font-luxury font-bold text-white mt-1">Receive Exclusive VIP Offers & New Drops</h3>
            <p className="text-slate-400 text-sm mt-2">Subscribe to get secret discount codes, festival collection previews, and seasonal updates directly in your inbox.</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-400 min-w-[280px]"
              required
            />
            <button
              type="submit"
              className="px-8 py-3.5 btn-gold rounded-2xl text-xs uppercase tracking-wider font-bold shadow-lg"
            >
              {subscribed ? 'Subscribed! 🎉' : 'Subscribe'}
            </button>
          </form>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-slate-800/80">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-luxury font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <h4 className="text-xl font-luxury font-bold text-white uppercase tracking-wider">Arti Garment</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Atarra • Banda</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Your premier destination for traditional ethnic couture and modern fashion apparel. Crafted with passion and quality in Atarra since generations.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'whatsapp'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600/20 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Collections</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {['Men\'s Kurta & Shirts', 'Women\'s Sarees & Lehengas', 'Kids\' Festival Wear', 'New Arrivals 2026', 'Wedding Edition'].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Store Address</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400">📍</span>
                <span>Main Bazaar, Atarra,<br />Dist. Banda, Uttar Pradesh - 210201</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-indigo-400">📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-indigo-400">⏰</span>
                <span>Mon - Sat: 9:00 AM - 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Embedded Google Map */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Visit Our Showroom</h4>
            <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14450.089!2d80.58!3d25.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c3f0a95a6d2e1%3A0xc45d66f87e0aba28!2sAtarra%2C%20Uttar%20Pradesh%20210201!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Arti Garment. All rights reserved. Handcrafted with luxury polish.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-semibold">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
