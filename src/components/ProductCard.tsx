'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useStore } from '@/store/StoreContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [addedToast, setAddedToast] = useState(false);

  const { dispatch, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    setRotateX(-(mouseY / rect.height) * 8);
    setRotateY((mouseX / rect.width) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        size: selectedSize,
        color: selectedColor,
      },
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.06 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? 'none' : 'transform 0.5s ease',
        }}
        className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100/90 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 flex flex-col justify-between"
      >
        {/* Toast notification */}
        <AnimatePresence>
          {addedToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-3 right-3 z-30 py-2 px-3 bg-indigo-600/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-xl flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added to Cart!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Image & Overlays */}
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Smooth overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Luxury Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-md backdrop-blur-md border border-white/10"
              >
                NEW
              </motion.span>
            )}
            {product.discount && (
              <span className="px-2.5 py-0.5 bg-rose-600/90 text-white text-[10px] font-bold rounded-full shadow-md backdrop-blur-md">
                -{product.discount}% OFF
              </span>
            )}
            {!product.inStock && (
              <span className="px-2.5 py-0.5 bg-amber-600/90 text-white text-[10px] font-bold rounded-full shadow-md backdrop-blur-md">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Wishlist Button with Heart Animation */}
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
            }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all duration-300"
            aria-label="Wishlist"
          >
            <motion.svg
              animate={wishlisted ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-4.5 h-4.5 transition-colors ${wishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </motion.svg>
          </motion.button>

          {/* Quick Action Overlay Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-3 left-3 right-3 z-10 flex gap-2"
          >
            <button
              onClick={() => setShowQuickView(true)}
              className="flex-1 py-2.5 bg-white/95 backdrop-blur-md text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-md"
            >
              Quick View
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add to Cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{product.subcategory}</span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-slate-700">{product.rating}</span>
              </div>
            </div>

            <Link href={`/product/${product.id}`} className="block mt-1">
              <h3 className="font-medium text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Sizes */}
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {product.sizes.slice(0, 4).map((size) => (
              <span key={size} className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded">
                {size}
              </span>
            ))}
          </div>

          {/* Price Row */}
          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100/80">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">In Stock</span>
          </div>
        </div>
      </motion.div>

      {/* ─── QUICK VIEW MODAL ─── */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl border border-slate-100 relative max-h-[90vh] flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              {/* Product Image */}
              <div className="w-full md:w-1/2 aspect-[4/5] bg-slate-50 relative overflow-hidden">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Details & Actions */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{product.category} • {product.subcategory}</span>
                  <h2 className="text-xl font-bold font-luxury text-slate-900 mt-1">{product.name}</h2>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size Selector */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Size</label>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedSize === s
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Available Color</label>
                    <div className="flex gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                            selectedColor === c ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={(e) => {
                      handleAddToCart(e);
                      setShowQuickView(false);
                    }}
                    disabled={!product.inStock}
                    className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    Add To Bag
                  </button>
                  <Link
                    href={`/product/${product.id}`}
                    onClick={() => setShowQuickView(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Full Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
