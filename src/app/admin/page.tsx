'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/store/ProductContext';
import { useOrders } from '@/store/OrderContext';
import { useBanners } from '@/store/BannerContext';
import { Product, OfferBanner as OfferBannerType } from '@/types';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'add' | 'banners' | 'orders' | 'customers' | 'analytics'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);

  const { allProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, isLoading, fetchAllOrders, updateOrderStatus } = useOrders();
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus, uploadImageWithProgress, reorderBanner } = useBanners();

  const [newProduct, setNewProduct] = useState<NewProduct>(emptyProduct);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Edit Product state
  const [editingProduct, setEditingProduct] = useState<(Product & { firestoreId?: string }) | null>(null);
  const [editForm, setEditForm] = useState<NewProduct & { isTrending?: boolean; isNew?: boolean }>(emptyProduct);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Banner State — full production form
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    description: '',
    discount: '',
    imageUrl: '',
    mobileImageUrl: '',
    buttonText: 'Shop Now',
    buttonLink: '/category/women',
    startDate: '',
    endDate: '',
    priority: 1,
    position: 'homepage',
    isActive: true,
  });
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<OfferBannerType | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerMobileImageFile, setBannerMobileImageFile] = useState<File | null>(null);
  const [editBannerImageFile, setEditBannerImageFile] = useState<File | null>(null);
  const [editBannerMobileImageFile, setEditBannerMobileImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [previewBanner, setPreviewBanner] = useState<OfferBannerType | null>(null);

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
      setSuccessMessage('Product Added Successfully!');
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
      isTrending: product.isTrending,
      isNew: product.isNew,
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
        isTrending: editForm.isTrending,
        isNew: editForm.isNew,
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

  const handleToggleProductTrending = async (product: Product) => {
    try {
      await updateProduct(product.id, { isTrending: !product.isTrending });
    } catch {
      alert('Failed to update homepage featured status.');
    }
  };

  const handleToggleProductNew = async (product: Product) => {
    try {
      await updateProduct(product.id, { isNew: !product.isNew });
    } catch {
      alert('Failed to update new arrivals status.');
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError('');
    setIsUploadingBanner(true);
    setUploadProgress(0);
    try {
      let imageUrl = newBanner.imageUrl;
      let mobileImageUrl = newBanner.mobileImageUrl;

      // Upload desktop banner image to Firebase Storage
      if (bannerImageFile) {
        imageUrl = await uploadImageWithProgress(bannerImageFile, (p) => setUploadProgress(p));
      }
      // Upload mobile banner image to Firebase Storage
      if (bannerMobileImageFile) {
        mobileImageUrl = await uploadImageWithProgress(bannerMobileImageFile);
      }

      if (!imageUrl) {
        setBannerError('Please provide a banner image (upload or URL).');
        setIsUploadingBanner(false);
        return;
      }

      await addBanner({
        ...newBanner,
        imageUrl,
        mobileImageUrl,
        priority: Number(newBanner.priority) || (banners.length + 1),
      });

      // Reset form
      setNewBanner({
        title: '', subtitle: '', description: '', discount: '',
        imageUrl: '', mobileImageUrl: '',
        buttonText: 'Shop Now', buttonLink: '/category/women',
        startDate: '', endDate: '', priority: banners.length + 2,
        position: 'homepage', isActive: true,
      });
      setBannerImageFile(null);
      setBannerMobileImageFile(null);
      setIsAddingBanner(false);
      setSuccessMessage('Banner Created & Saved to Firestore!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('[Admin] Banner add failed:', err);
      setBannerError('Failed to save offer banner. Check console for details.');
    } finally {
      setIsUploadingBanner(false);
      setUploadProgress(0);
    }
  };

  const handleEditBannerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setBannerError('');
    setIsUploadingBanner(true);
    setUploadProgress(0);
    try {
      let imageUrl = editingBanner.imageUrl;
      let mobileImageUrl = editingBanner.mobileImageUrl;

      // Upload new desktop image if selected
      if (editBannerImageFile) {
        imageUrl = await uploadImageWithProgress(editBannerImageFile, (p) => setUploadProgress(p));
      }
      // Upload new mobile image if selected
      if (editBannerMobileImageFile) {
        mobileImageUrl = await uploadImageWithProgress(editBannerMobileImageFile);
      }

      await updateBanner(editingBanner.id, {
        title: editingBanner.title,
        subtitle: editingBanner.subtitle,
        description: editingBanner.description,
        discount: editingBanner.discount,
        imageUrl,
        mobileImageUrl,
        buttonText: editingBanner.buttonText,
        buttonLink: editingBanner.buttonLink,
        startDate: editingBanner.startDate,
        endDate: editingBanner.endDate,
        priority: Number(editingBanner.priority) || 1,
        position: editingBanner.position,
        isActive: editingBanner.isActive,
      });

      setEditingBanner(null);
      setEditBannerImageFile(null);
      setEditBannerMobileImageFile(null);
      setSuccessMessage('Banner Updated Successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('[Admin] Banner edit failed:', err);
      setBannerError('Failed to update banner.');
    } finally {
      setIsUploadingBanner(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Delete this banner? Images will also be removed from Firebase Storage.')) {
      try {
        await deleteBanner(id);
        setSuccessMessage('Banner Deleted.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch {
        alert('Failed to delete banner.');
      }
    }
  };

  const handleMoveBannerPriority = async (id: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id || b.firestoreId === id);
    if (idx < 0) return;
    const newPriority = direction === 'up' ? Math.max(1, (banners[idx].priority || 1) - 1) : (banners[idx].priority || 1) + 1;
    await reorderBanner(id, newPriority);
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
            <span>✨</span> {successMessage || 'Operation Successful!'}
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
              { id: 'banners' as const, label: 'Offer Banners', icon: '📢', badge: banners.filter(b => b.isActive).length },
              { id: 'orders' as const, label: 'Orders', icon: '📦', badge: orders.filter(o => o.status === 'pending').length },
              { id: 'customers' as const, label: 'Customers', icon: '👥' },
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
                        <th className="p-4">Homepage Display</th>
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
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleProductTrending(p)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                                  p.isTrending ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-400'
                                }`}
                                title="Toggle Featured on Homepage"
                              >
                                {p.isTrending ? '★ Featured' : '+ Featured'}
                              </button>
                              <button
                                onClick={() => handleToggleProductNew(p)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                                  p.isNew ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-slate-100 text-slate-400'
                                }`}
                                title="Toggle New Arrival on Homepage"
                              >
                                {p.isNew ? '✨ New' : '+ New'}
                              </button>
                            </div>
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
                        placeholder="e.g. Kurta / Saree / Lehenga"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="1899"
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
                        placeholder="2999"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Available Sizes (comma-separated)</label>
                      <input
                        type="text"
                        value={newProduct.sizes}
                        onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                        placeholder="S, M, L, XL, XXL"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Available Colors (comma-separated)</label>
                    <input
                      type="text"
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      placeholder="Navy Blue, Royal Black, Maroon"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
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

          {/* ═══════ TAB: OFFER BANNER MANAGEMENT (Production-Ready) ═══════ */}
          {activeTab === 'banners' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-luxury text-slate-900">Offer Banner Management</h2>
                  <p className="text-xs text-slate-400">Create, schedule, and reorder homepage promotional banners • Firestore + Storage</p>
                </div>
                <button
                  onClick={() => { setIsAddingBanner(!isAddingBanner); setBannerError(''); }}
                  className="btn-primary py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  {isAddingBanner ? '✕ Close Form' : '+ Create New Banner'}
                </button>
              </div>

              {/* Error Alert */}
              {bannerError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between">
                  <span>⚠️ {bannerError}</span>
                  <button onClick={() => setBannerError('')} className="text-rose-400 hover:text-rose-600">✕</button>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploadingBanner && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                    <span>📤 Uploading Banner Image to Firebase Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* ── CREATE BANNER FORM ── */}
              {isAddingBanner && (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold uppercase text-slate-900">Create New Offer Banner</h3>
                  <form onSubmit={handleAddBanner} className="space-y-4 text-xs font-medium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Banner Title *</label>
                        <input type="text" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} placeholder="e.g. Flat 40% Off Wedding Collection" className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Subtitle</label>
                        <input type="text" value={newBanner.subtitle} onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })} placeholder="e.g. Premium Kurtas, Sarees & Lehengas" className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-700 font-bold uppercase mb-1">Description</label>
                        <textarea rows={2} value={newBanner.description} onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })} placeholder="Additional details about this offer..." className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500 resize-none" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Discount Tag</label>
                        <input type="text" value={newBanner.discount} onChange={(e) => setNewBanner({ ...newBanner, discount: e.target.value })} placeholder="e.g. 40% OFF or BUY 1 GET 1" className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Priority (Order)</label>
                        <input type="number" min="1" value={newBanner.priority} onChange={(e) => setNewBanner({ ...newBanner, priority: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Desktop Banner Image *</label>
                        <input type="file" accept="image/*" onChange={(e) => { setBannerImageFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setNewBanner({...newBanner, imageUrl: ''}); }} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-100 file:text-indigo-700 file:font-bold file:cursor-pointer" />
                        {bannerImageFile && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ Selected: {bannerImageFile.name}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">Or paste URL below:</p>
                        <input type="url" value={newBanner.imageUrl} onChange={(e) => { setNewBanner({ ...newBanner, imageUrl: e.target.value }); setBannerImageFile(null); }} placeholder="https://images.unsplash.com/..." className="w-full p-2.5 mt-1 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Mobile Banner Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={(e) => setBannerMobileImageFile(e.target.files?.[0] || null)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer" />
                        {bannerMobileImageFile && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ Selected: {bannerMobileImageFile.name}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">Or paste URL:</p>
                        <input type="url" value={newBanner.mobileImageUrl} onChange={(e) => { setNewBanner({ ...newBanner, mobileImageUrl: e.target.value }); setBannerMobileImageFile(null); }} placeholder="https://..." className="w-full p-2.5 mt-1 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* CTA & Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Button Text</label>
                        <input type="text" value={newBanner.buttonText} onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })} placeholder="e.g. Shop Now" className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Button Link</label>
                        <input type="text" value={newBanner.buttonLink} onChange={(e) => setNewBanner({ ...newBanner, buttonLink: e.target.value })} placeholder="/category/women" className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">Start Date (Schedule)</label>
                        <input type="date" value={newBanner.startDate} onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase mb-1">End Date (Auto-Expire)</label>
                        <input type="date" value={newBanner.endDate} onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newBanner.isActive} onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                        <span className="font-bold uppercase text-slate-700">Activate Immediately</span>
                      </label>
                    </div>

                    <button type="submit" disabled={isUploadingBanner} className="w-full btn-primary py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-60">
                      {isUploadingBanner ? `Uploading... ${uploadProgress}%` : 'Save Banner to Firestore'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── EXISTING BANNERS LIST ── */}
              {banners.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                  <div className="text-4xl mb-3">📢</div>
                  <h3 className="text-base font-bold text-slate-900">No Offer Banners in Firestore</h3>
                  <p className="text-slate-400 text-xs mt-1">Click &quot;+ Create New Banner&quot; to add your first promotional banner.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner, idx) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isExpired = banner.endDate ? banner.endDate < today : false;
                    const isScheduled = banner.startDate ? banner.startDate > today : false;

                    return (
                      <div key={banner.firestoreId || banner.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          {/* Banner Preview Thumbnail */}
                          <div
                            className="w-full md:w-72 min-h-[140px] relative flex-shrink-0 flex items-center justify-center text-white p-6"
                            style={{
                              background: banner.imageUrl
                                ? `linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.85)), url(${banner.imageUrl}) center/cover no-repeat`
                                : 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                            }}
                          >
                            <div className="text-center relative z-10">
                              {banner.discount && <span className="text-amber-300 text-[10px] font-bold uppercase block mb-1">{banner.discount}</span>}
                              <p className="font-luxury font-bold text-sm leading-snug">{banner.title}</p>
                            </div>
                          </div>

                          {/* Banner Details & Actions */}
                          <div className="flex-1 p-5 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase bg-slate-100 text-slate-600">
                                  Priority: {banner.priority || idx + 1}
                                </span>
                                {isExpired ? (
                                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase bg-red-100 text-red-600">Expired</span>
                                ) : isScheduled ? (
                                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase bg-blue-100 text-blue-600">Scheduled</span>
                                ) : banner.isActive ? (
                                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase bg-emerald-100 text-emerald-600">Live</span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase bg-slate-200 text-slate-500">Inactive</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {banner.startDate && <span>From: {banner.startDate}</span>}
                                {banner.endDate && <span className="ml-2">To: {banner.endDate}</span>}
                              </div>
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 text-sm">{banner.title}</p>
                              {banner.subtitle && <p className="text-xs text-slate-500 mt-0.5">{banner.subtitle}</p>}
                              {banner.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{banner.description}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {/* Reorder Controls */}
                              <button onClick={() => handleMoveBannerPriority(banner.id, 'up')} disabled={idx === 0} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 text-[10px] font-bold" title="Move Up">▲</button>
                              <button onClick={() => handleMoveBannerPriority(banner.id, 'down')} disabled={idx === banners.length - 1} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 text-[10px] font-bold" title="Move Down">▼</button>

                              <button onClick={() => toggleBannerStatus(banner.id, banner.isActive)} className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all ${banner.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                {banner.isActive ? 'Disable' : 'Enable'}
                              </button>
                              <button onClick={() => setPreviewBanner(banner)} className="px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-[10px] transition-colors">
                                👁 Preview
                              </button>
                              <button onClick={() => { setEditingBanner(banner); setEditBannerImageFile(null); setEditBannerMobileImageFile(null); setBannerError(''); }} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-[10px] transition-colors">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteBanner(banner.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-[10px] transition-colors">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

        {/* ═══ EDIT BANNER MODAL (Production) ═══ */}
        {editingBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setEditingBanner(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase">Edit Offer Banner</h3>
                <button onClick={() => setEditingBanner(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
              </div>

              {isUploadingBanner && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-indigo-700">
                    <span>Uploading...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleEditBannerSave} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Banner Title *</label>
                    <input type="text" value={editingBanner.title} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Subtitle</label>
                    <input type="text" value={editingBanner.subtitle || ''} onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Description</label>
                  <textarea rows={2} value={editingBanner.description || ''} onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Discount Tag</label>
                    <input type="text" value={editingBanner.discount || ''} onChange={(e) => setEditingBanner({ ...editingBanner, discount: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Priority</label>
                    <input type="number" min="1" value={editingBanner.priority || 1} onChange={(e) => setEditingBanner({ ...editingBanner, priority: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Desktop Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setEditBannerImageFile(e.target.files?.[0] || null)} className="w-full p-2 bg-slate-50 border rounded-xl text-xs file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-indigo-100 file:text-indigo-700 file:font-bold file:cursor-pointer" />
                    {editBannerImageFile && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ New: {editBannerImageFile.name}</p>}
                    {!editBannerImageFile && editingBanner.imageUrl && <p className="text-[10px] text-slate-400 mt-1 truncate">Current: {editingBanner.imageUrl.substring(0, 50)}...</p>}
                    <input type="url" value={editingBanner.imageUrl || ''} onChange={(e) => { setEditingBanner({ ...editingBanner, imageUrl: e.target.value }); setEditBannerImageFile(null); }} placeholder="Or paste URL" className="w-full p-2 mt-1 bg-slate-50 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Mobile Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setEditBannerMobileImageFile(e.target.files?.[0] || null)} className="w-full p-2 bg-slate-50 border rounded-xl text-xs file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer" />
                    {editBannerMobileImageFile && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ New: {editBannerMobileImageFile.name}</p>}
                    <input type="url" value={editingBanner.mobileImageUrl || ''} onChange={(e) => { setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value }); setEditBannerMobileImageFile(null); }} placeholder="Or paste URL" className="w-full p-2 mt-1 bg-slate-50 border rounded-xl text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Button Text</label>
                    <input type="text" value={editingBanner.buttonText || ''} onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Button Link</label>
                    <input type="text" value={editingBanner.buttonLink || ''} onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Start Date</label>
                    <input type="date" value={editingBanner.startDate || ''} onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">End Date</label>
                    <input type="date" value={editingBanner.endDate || ''} onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingBanner.isActive} onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="font-bold uppercase text-slate-700">Banner Active</span>
                  </label>
                </div>
                <button type="submit" disabled={isUploadingBanner} className="w-full btn-primary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-60">
                  {isUploadingBanner ? `Uploading... ${uploadProgress}%` : 'Update Offer Banner'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ BANNER PREVIEW MODAL ═══ */}
        {previewBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-lg"
            onClick={() => setPreviewBanner(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-bold uppercase tracking-wider">Banner Preview — Live Render</h3>
                <button onClick={() => setPreviewBanner(null)} className="text-white/60 hover:text-white text-lg">✕</button>
              </div>
              <div
                className="relative overflow-hidden rounded-3xl p-8 md:p-14 border border-white/10 shadow-2xl min-h-[240px] flex items-center"
                style={{
                  background: previewBanner.imageUrl
                    ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${previewBanner.imageUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)',
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div className="max-w-2xl space-y-3">
                    {previewBanner.discount && (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 backdrop-blur-md border border-amber-400/40 rounded-full text-xs font-bold text-amber-300 uppercase tracking-wider">🎉 {previewBanner.discount}</span>
                    )}
                    <h3 className="text-3xl md:text-5xl font-luxury font-bold text-white tracking-tight leading-tight">{previewBanner.title}</h3>
                    {previewBanner.subtitle && <p className="text-slate-200 text-sm md:text-base font-light">{previewBanner.subtitle}</p>}
                    {previewBanner.description && <p className="text-slate-300 text-xs md:text-sm">{previewBanner.description}</p>}
                  </div>
                  <span className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider shadow-xl cursor-default flex-shrink-0">
                    {previewBanner.buttonText || 'Shop Now'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </div>
              <p className="text-center text-white/40 text-[10px] uppercase tracking-widest">This is how the banner will appear on the homepage</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

