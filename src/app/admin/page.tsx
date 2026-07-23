'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/store/ProductContext';
import { useOrders } from '@/store/OrderContext';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'add' | 'orders' | 'analytics'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);

  const { allProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, isLoading, fetchAllOrders, updateOrderStatus } = useOrders();
  const [newProduct, setNewProduct] = useState<NewProduct>(emptyProduct);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Edit state
  const [editingProduct, setEditingProduct] = useState<(Product & { firestoreId?: string }) | null>(null);
  const [editForm, setEditForm] = useState<NewProduct>(emptyProduct);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllOrders();
    }
  }, [isAuthenticated, fetchAllOrders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'shubham18') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password. Please try again.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
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
        rating: 4.5,
        reviews: 1,
        isNew: true,
        inStock: true,
        discount: newProduct.originalPrice
          ? Math.round((1 - Number(newProduct.price) / Number(newProduct.originalPrice)) * 100)
          : undefined,
      };

      await addProduct(product, newProduct.imageUrl || undefined);
      setNewProduct(emptyProduct);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveTab('products');
    } catch (error) {
      console.error('[Admin] Failed to add product:', error);
      alert('Product add karne mein problem hui. Internet connection check karein.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleEditOpen = (product: Product) => {
    setEditingProduct(product as Product & { firestoreId?: string });
    setEditForm({
      name: product.name,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category,
      subcategory: product.subcategory,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      description: product.description,
      imageUrl: product.images[0] || '',
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isEditSubmitting) return;
    setIsEditSubmitting(true);
    try {
      const updates: Partial<Product> = {
        name: editForm.name,
        price: Number(editForm.price),
        originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : undefined,
        category: editForm.category,
        subcategory: editForm.subcategory,
        sizes: editForm.sizes.split(',').map(s => s.trim()),
        colors: editForm.colors.split(',').map(c => c.trim()),
        description: editForm.description,
        images: [editForm.imageUrl || '/images/products/kurta-navy.png'],
        discount: editForm.originalPrice
          ? Math.round((1 - Number(editForm.price) / Number(editForm.originalPrice)) * 100)
          : undefined,
      };
      await updateProduct(editingProduct.id, updates);
      setEditingProduct(null);
    } catch {
      alert('Update karne mein problem hui. Dobara try karein.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
    } catch {
      alert('Stock update karne mein problem hui.');
    }
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.subcategory.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.userName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden bg-amber-500/10 border border-amber-400/30 p-1 mb-4 shadow-2xl shadow-amber-500/20">
              <img src="/images/logo.png" alt="Arti Garment Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h1 className="text-3xl font-luxury font-bold text-white tracking-wider uppercase">Luxury Admin Portal</h1>
            <p className="text-slate-400 mt-1 text-xs uppercase tracking-widest font-semibold">Arti Garment • Management System</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 rounded-3xl glass-dark border border-white/10 shadow-2xl space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Admin Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 btn-primary rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl"
            >
              Authenticate & Launch
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50/80 text-slate-900'} transition-colors duration-300 flex`}>
      {/* Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[100] px-6 py-3 bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <span>✨</span> Product Added Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDEBAR (Glassmorphism, Collapsible) ─── */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 z-30 flex flex-col justify-between p-4 sticky top-0 h-screen ${
          darkMode ? 'bg-slate-900/90 border-r border-slate-800' : 'bg-white/90 border-r border-slate-200/80'
        } backdrop-blur-2xl`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-amber-500/10 border border-amber-500/20 p-0.5 flex-shrink-0 shadow-lg">
                <img src="/images/logo.png" alt="Arti Garment Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-luxury font-bold text-sm uppercase tracking-wider truncate">Arti Garment</h2>
                  <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Luxury Suite</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
              title="Toggle Sidebar"
            >
              <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard' as const, label: 'Overview', icon: '📊' },
              { id: 'products' as const, label: 'Catalog', icon: '🛍️' },
              { id: 'add' as const, label: 'Add Product', icon: '✨' },
              { id: 'orders' as const, label: 'Orders', icon: '📦', badge: orders.filter(o => o.status === 'pending').length },
              { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left truncate uppercase tracking-wider">{tab.label}</span>
                )}
                {!sidebarCollapsed && tab.badge ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 border-t border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              SG
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Shubham Gupta</p>
                <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="mt-3 w-full py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors text-[11px] font-bold uppercase tracking-wider"
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        {/* Top Navbar */}
        <header className={`sticky top-0 z-20 px-8 py-4 flex items-center justify-between border-b ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/60'} backdrop-blur-2xl`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-bold uppercase tracking-wider">{activeTab}</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog or orders..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 sm:w-64 transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                🔔
              </button>
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Content */}
        <div className="p-6 md:p-10 space-y-8">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Header Title */}
              <div>
                <h1 className="text-3xl font-luxury font-bold tracking-tight">Executive Dashboard</h1>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">Real-time Metrics & Insights</p>
              </div>

              {/* Stat Cards with Sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Total Revenue',
                    value: `₹${totalRevenue.toLocaleString()}`,
                    change: '+18.4%',
                    icon: '💰',
                    color: 'from-emerald-500 to-teal-600',
                    spark: 'M0,25 Q15,10 30,20 T60,5 T90,15 T120,2',
                  },
                  {
                    title: 'Total Orders',
                    value: totalOrdersCount,
                    change: '+12.1%',
                    icon: '📦',
                    color: 'from-indigo-500 to-purple-600',
                    spark: 'M0,20 Q15,25 30,10 T60,18 T90,5 T120,12',
                  },
                  {
                    title: 'Catalog Items',
                    value: allProducts.length,
                    change: '+4 new',
                    icon: '🛍️',
                    color: 'from-blue-500 to-cyan-600',
                    spark: 'M0,15 Q15,20 30,8 T60,14 T90,2 T120,10',
                  },
                  {
                    title: 'Active Customers',
                    value: '142',
                    change: '+24.5%',
                    icon: '👤',
                    color: 'from-amber-500 to-orange-600',
                    spark: 'M0,28 Q15,18 30,22 T60,8 T90,16 T120,4',
                  },
                ].map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl p-2 bg-slate-50 rounded-2xl">{card.icon}</span>
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                        {card.change}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>

                    {/* SVG Sparkline Graph */}
                    <div className="mt-4 pt-2">
                      <svg className="w-full h-8 stroke-indigo-500 fill-none" viewBox="0 0 120 30">
                        <path d={card.spark} strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Visual Charts & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart Mockup */}
                <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Revenue & Sales Performance</h3>
                      <p className="text-xs text-slate-400">Monthly breakdown for 2026</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Monthly</span>
                  </div>

                  {/* Pure CSS/SVG Bar Chart */}
                  <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6">
                    {[
                      { month: 'Jan', val: 40 },
                      { month: 'Feb', val: 65 },
                      { month: 'Mar', val: 50 },
                      { month: 'Apr', val: 85 },
                      { month: 'May', val: 95 },
                      { month: 'Jun', val: 75 },
                      { month: 'Jul', val: 110 },
                    ].map((item) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.val}%` }}
                          transition={{ duration: 0.8 }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-2xl group-hover:brightness-110 transition-all relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg transition-opacity pointer-events-none">
                            {item.val}k
                          </span>
                        </motion.div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                  <p className="text-xs text-slate-400">Frequent merchant tasks</p>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setActiveTab('add')}
                      className="w-full p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                    >
                      <span>➕ Add New Product</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                    >
                      <span>📋 Manage Orders</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="w-full p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                    >
                      <span>📦 Inventory Stock</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-luxury text-slate-900">Products Catalog</h2>
                  <p className="text-xs text-slate-400">Manage, edit prices & stock status</p>
                </div>
                <button
                  onClick={() => setActiveTab('add')}
                  className="btn-primary py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  + Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        <th className="p-4 pl-6">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.subcategory}</p>
                            </div>
                          </td>
                          <td className="p-4 capitalize">
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            ₹{p.price.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="p-4 text-right pr-6 space-x-2">
                            <button
                              onClick={() => handleEditOpen(p)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-[11px] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-[11px] transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ADD PRODUCT */}
          {activeTab === 'add' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-luxury text-slate-900">Add New Luxury Product</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Fill details to list on the website immediately</p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Royal Navy Velvet Kurta"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as 'men' | 'women' | 'kids' })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Subcategory *</label>
                      <input
                        type="text"
                        value={newProduct.subcategory}
                        onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                        placeholder="e.g. Kurta, Saree, Sherwani"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="2499"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                        placeholder="3999"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Sizes (comma separated)</label>
                      <input
                        type="text"
                        value={newProduct.sizes}
                        onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                        placeholder="S, M, L, XL"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Description *</label>
                    <textarea
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Crafted with pure silk..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving Product...' : 'Publish Product'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-luxury text-slate-900">Order Management</h2>
                  <p className="text-xs text-slate-400">Real-time orders synced with Firebase Firestore</p>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                        orderStatusFilter === st ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {isLoading ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                  <div className="text-3xl animate-bounce mb-2">⏳</div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Firestore Orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                  <p className="text-slate-400 text-sm font-semibold">No orders found under selected filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900 font-mono">ID: {order.id}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <p className="font-bold text-slate-800">👤 Customer</p>
                          <p className="font-medium text-slate-700 mt-0.5">{order.userName}</p>
                          <p className="text-slate-400 text-[11px]">{order.userEmail}</p>
                          <p className="text-indigo-600 font-bold mt-1">📞 {order.deliveryAddress.phone}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <p className="font-bold text-slate-800">📍 Shipping Address</p>
                          <p className="text-slate-600 mt-0.5">{order.deliveryAddress.address}</p>
                          <p className="text-slate-400">{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs border border-slate-100">
                            <img src={it.productImage} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-slate-800 truncate max-w-[120px]">{it.productName}</p>
                              <p className="text-[10px] text-slate-400">{it.selectedSize} × {it.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <p className="text-lg font-bold text-slate-900">₹{order.totalAmount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">(COD)</span></p>
                        <div className="flex gap-2">
                          <a href={`tel:${order.deliveryAddress.phone}`} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                            📞 Call
                          </a>
                          {order.status === 'pending' && (
                            <>
                              <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
                                Accept
                              </button>
                              {rejectingId === order.id ? (
                                <div className="flex items-center gap-2">
                                  <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason" className="px-2 py-1 text-xs border rounded-xl w-28" />
                                  <button onClick={() => { updateOrderStatus(order.id, 'rejected', rejectReason); setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
                                    Confirm Reject
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setRejectingId(order.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100">
                                  Reject
                                </button>
                              )}
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">
                              Dispatch Order
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-luxury text-slate-900">Analytics Suite</h2>
                <p className="text-xs text-slate-400">Customer conversions, category distribution & growth</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Category Distribution</h3>
                  <div className="space-y-3 pt-2 text-xs">
                    {[
                      { cat: 'Men\'s Collection', count: allProducts.filter(p => p.category === 'men').length, color: 'bg-indigo-600' },
                      { cat: 'Women\'s Couture', count: allProducts.filter(p => p.category === 'women').length, color: 'bg-pink-500' },
                      { cat: 'Kids Wear', count: allProducts.filter(p => p.category === 'kids').length, color: 'bg-amber-500' },
                    ].map((c) => (
                      <div key={c.cat} className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{c.cat}</span>
                          <span>{c.count} items</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${c.color}`} style={{ width: `${(c.count / (allProducts.length || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Conversion Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-center pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-2xl font-bold text-indigo-600">3.8%</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Conversion Rate</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-2xl font-bold text-emerald-600">₹2,850</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avg Order Value</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase">Edit Product details</h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Product Title</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Price (₹)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Category</label>
                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value as 'men' | 'women' | 'kids' })} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Description</label>
                  <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl resize-none" required />
                </div>
                <button type="submit" disabled={isEditSubmitting} className="w-full btn-primary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider">
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
