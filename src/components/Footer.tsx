'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden pt-16 pb-12 border-t border-slate-800/80">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-slate-800/80">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-500/10 border border-amber-500/20 p-0.5 flex-shrink-0 shadow-lg">
                <img src="/images/logo.png" alt="Arti Garment Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h4 className="text-xl font-luxury font-bold text-white uppercase tracking-wider">Arti Garment</h4>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Fashion For Every You</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Your premier destination for traditional ethnic couture and modern fashion apparel. Crafted with passion and quality in Atarra since generations.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/aarti_garments_01"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Instagram: @aarti_garments_01"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 hover:bg-pink-600/10 text-slate-400 hover:text-pink-400 transition-all duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-xs font-semibold">Instagram</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/917985325543"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp: +91 79853 25543"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-emerald-600/10 text-slate-400 hover:text-emerald-400 transition-all duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span className="text-xs font-semibold">WhatsApp</span>
              </a>
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
                <a href="tel:+917985325543" className="hover:text-indigo-400 transition-colors font-medium">
                  +91 79853 25543
                </a>
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
            <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video relative group bg-slate-900 shadow-lg">
              <iframe
                title="Arti Garment Location Map"
                src="https://maps.google.com/maps?q=Main+Bazaar+Atarra+Banda+Uttar+Pradesh+210201&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full rounded-2xl opacity-90 hover:opacity-100 transition-opacity"
              />
              <a
                href="https://maps.google.com/?q=Main+Bazaar+Atarra+Banda+Uttar+Pradesh+210201"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/90 border border-slate-700 hover:border-indigo-500 rounded-xl text-[10px] font-bold text-indigo-400 hover:text-white flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
              >
                <span>📍 Open Maps</span>
              </a>
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
