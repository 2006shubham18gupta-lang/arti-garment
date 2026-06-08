'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products as initialProducts } from '@/data/products';
import { Product } from '@/types';

interface NewProduct {
  name: string;
  price: string;
  originalPrice: string;
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  sizes: string;
  colors: string;
  description: string;
  imageUrl: string;
}

const emptyProduct: NewProduct = {
  name: '',
  price: '',
  originalPrice: '',
  category: 'men',
  subcategory: '',
  sizes: '',
  colors: '',
  description: '',
  imageUrl: '',
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'orders'>('products');
  const [adminProducts, setAdminProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState<NewProduct>(emptyProduct);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'shubham18') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setNewProduct(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      sizes: newProduct.sizes.split(',').map(s => s.trim()),
      colors: newProduct.colors.split(',').map(c => c.trim()),
      images: [newProduct.imageUrl || '/images/products/kurta-navy.png'],
      description: newProduct.description,
      rating: 4.0,
      reviews: 0,
      isNew: true,
      inStock: true,
      discount: newProduct.originalPrice
        ? Math.round((1 - Number(newProduct.price) / Number(newProduct.originalPrice)) * 100)
        : undefined,
    };

    setAdminProducts(prev => [product, ...prev]);
    setNewProduct(emptyProduct);
    setPreviewImage('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setAdminProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-2xl mb-4 shadow-2xl shadow-primary-500/30">
              A
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50 mt-1 text-sm">Arti Garment Management</p>
          </div>

          <form onSubmit={handleLogin} className="glass-dark rounded-3xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-display font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Login to Dashboard
            </button>

          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 bg-green-500 text-white font-medium rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Product added successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-900">Admin Dashboard</h1>
            <p className="text-surface-500 mt-1">Manage your Arti Garment products</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-surface-100 text-surface-600 rounded-xl hover:bg-surface-200 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: adminProducts.length, icon: '📦', color: 'from-blue-500 to-indigo-600' },
            { label: "Men's Items", value: adminProducts.filter(p => p.category === 'men').length, icon: '👔', color: 'from-cyan-500 to-blue-600' },
            { label: "Women's Items", value: adminProducts.filter(p => p.category === 'women').length, icon: '👗', color: 'from-pink-500 to-rose-600' },
            { label: "Kids' Items", value: adminProducts.filter(p => p.category === 'kids').length, icon: '🧒', color: 'from-amber-500 to-orange-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {stat.value}
                </div>
              </div>
              <p className="text-sm text-surface-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-100 rounded-2xl mb-8 max-w-md">
          {[
            { id: 'products' as const, label: 'All Products', icon: '📋' },
            { id: 'add' as const, label: 'Add Product', icon: '➕' },
            { id: 'orders' as const, label: 'Orders', icon: '📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Product</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Price</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {adminProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-surface-800">{product.name}</p>
                              <p className="text-xs text-surface-400">{product.subcategory}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm text-surface-800">₹{product.price.toLocaleString()}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-surface-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-surface-600">{product.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            product.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 p-6 md:p-8"
            >
              <h2 className="text-xl font-display font-bold text-surface-900 mb-6">Add New Product</h2>
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Royal Navy Silk Kurta"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value as 'men' | 'women' | 'kids' }))}
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Subcategory *</label>
                    <input
                      type="text"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="e.g. Kurta, Saree, Lehenga"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Selling Price (₹) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="1999"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Original Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                      placeholder="2999"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    />
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Sizes (comma separated) *</label>
                    <input
                      type="text"
                      value={newProduct.sizes}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, sizes: e.target.value }))}
                      placeholder="S, M, L, XL, XXL"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Colors (comma separated) *</label>
                    <input
                      type="text"
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, colors: e.target.value }))}
                      placeholder="Navy Blue, Black, Maroon"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Product Image</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-8 bg-surface-50 border-2 border-dashed border-surface-200 rounded-xl text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
                    >
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl mx-auto" />
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-surface-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-surface-400">Click to upload image</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description *</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the product in detail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="btn-primary py-3.5 px-8 rounded-xl text-base"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewProduct(emptyProduct); setPreviewImage(''); }}
                    className="px-6 py-3 bg-surface-100 text-surface-600 rounded-xl hover:bg-surface-200 transition-colors font-medium"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 p-8 md:p-12 text-center"
            >
              <div className="max-w-sm mx-auto">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-display font-semibold text-surface-700 mb-2">
                  Orders Dashboard
                </h3>
                <p className="text-surface-400 mb-6">
                  Order management will be available once you integrate a payment gateway. 
                  Currently products are being managed locally.
                </p>
                <div className="p-4 bg-primary-50 rounded-2xl">
                  <p className="text-sm text-primary-700 font-medium">
                    💡 Tip: Connect with Razorpay or PhonePe for easy payment processing
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
