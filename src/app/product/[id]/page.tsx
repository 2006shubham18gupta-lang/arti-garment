'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useProducts } from '@/store/ProductContext';
import { useStore } from '@/store/StoreContext';
import ProductCard from '@/components/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const { getProductById, allProducts } = useProducts();
  const product = getProductById(params.id as string);
  const { dispatch, isInWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-surface-800 mb-4">Product Not Found</h1>
          <p className="text-surface-500 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        size: selectedSize,
        color: selectedColor || product.colors[0],
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-surface-400 mb-8"
        >
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category}`} className="hover:text-primary-600 transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-surface-700">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              ref={imgRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-surface-50 cursor-crosshair group"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={isZooming ? {
                  transform: 'scale(2)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                } : {}}
              />

              {/* Zoom lens indicator */}
              <AnimatePresence>
                {isZooming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                  >
                    🔍 Hover to zoom
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full shadow-lg">
                    NEW
                  </span>
                )}
                {product.discount && (
                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category tag */}
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full uppercase tracking-wider">
              {product.subcategory}
            </span>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-surface-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-surface-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-bold text-surface-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-surface-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-sm font-semibold rounded-lg">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-surface-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'border-surface-200 text-surface-600 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-3">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-300 ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-surface-200 text-surface-600 hover:border-primary-300'
                    }`}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-2xl font-display font-bold text-base transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'btn-primary'
                }`}
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: product })}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                  wishlisted
                    ? 'border-red-200 bg-red-50'
                    : 'border-surface-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <motion.svg
                  animate={wishlisted ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-6 h-6 ${wishlisted ? 'text-red-500' : 'text-surface-400'}`}
                  fill={wishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </motion.svg>
              </motion.button>
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100">
              {[
                { icon: '🚚', label: 'Free Delivery', desc: 'Above ₹999' },
                { icon: '↩️', label: 'Easy Returns', desc: '7-day return' },
                { icon: '✅', label: 'Quality Assured', desc: 'Premium fabric' },
                { icon: '💳', label: 'COD Available', desc: 'Cash on delivery' },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-surface-700">{info.label}</p>
                    <p className="text-[10px] text-surface-400">{info.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="section-heading mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
