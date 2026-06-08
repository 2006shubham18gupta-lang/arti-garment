'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';
import { useStore } from '@/store/StoreContext';

export default function ProfilePage() {
  const router = useRouter();
  const { state: authState, logout, updateProfile, updateAddress } = useAuth();
  const { state: storeState } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Address fields
  const [editAddr1, setEditAddr1] = useState('');
  const [editAddr2, setEditAddr2] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editLandmark, setEditLandmark] = useState('');

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-50 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-surface-800 mb-2">Please Login</h2>
          <p className="text-surface-400 text-sm mb-6">Login to view your profile and orders</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary px-6 py-3 rounded-xl">Login</Link>
            <Link href="/signup" className="btn-secondary px-6 py-3 rounded-xl">Sign Up</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const user = authState.user;

  const startEditProfile = () => {
    setEditName(user.fullName);
    setEditPhone(user.phone);
    setEditEmail(user.email);
    setIsEditing(true);
  };

  const saveProfile = () => {
    updateProfile({ fullName: editName, phone: editPhone, email: editEmail });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEditAddress = () => {
    setEditAddr1(user.address.addressLine1);
    setEditAddr2(user.address.addressLine2 || '');
    setEditCity(user.address.city);
    setEditState(user.address.state);
    setEditPincode(user.address.pincode);
    setEditLandmark(user.address.landmark || '');
    setIsEditingAddress(true);
  };

  const saveAddress = () => {
    updateAddress({
      fullName: user.fullName,
      phone: user.phone,
      addressLine1: editAddr1,
      addressLine2: editAddr2,
      city: editCity,
      state: editState,
      pincode: editPincode,
      landmark: editLandmark,
    });
    setIsEditingAddress(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const inputClass = "w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-800 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all";

  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-50">
      {/* Saved Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 bg-green-500 text-white font-medium rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-surface-700">My Profile</span>
          </nav>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-surface-100 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-display font-bold text-2xl border-2 border-white/30">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h1 className="text-xl md:text-2xl font-display font-bold">{user.fullName}</h1>
                <p className="text-white/70 text-sm">{user.email} • +91 {user.phone}</p>
                <p className="text-white/50 text-xs mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-b border-surface-100">
            <div className="p-4 text-center border-r border-surface-100">
              <p className="text-2xl font-display font-bold text-primary-600">{storeState.cart.length}</p>
              <p className="text-xs text-surface-400">In Cart</p>
            </div>
            <div className="p-4 text-center border-r border-surface-100">
              <p className="text-2xl font-display font-bold text-accent-600">{storeState.wishlist.length}</p>
              <p className="text-xs text-surface-400">Wishlist</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-green-600">0</p>
              <p className="text-xs text-surface-400">Orders</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-surface-100 mb-6">
          {[
            { id: 'profile' as const, label: '👤 Profile' },
            { id: 'address' as const, label: '📍 Address' },
            { id: 'orders' as const, label: '📦 Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-surface-900">Personal Information</h2>
                {!isEditing && (
                  <button onClick={startEditProfile} className="text-sm text-primary-600 font-semibold hover:underline">
                    ✏️ Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Phone Number</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Email</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveProfile} className="btn-primary px-6 py-2.5 rounded-xl text-sm">Save</button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Name', value: user.fullName, icon: '👤' },
                    { label: 'Phone', value: `+91 ${user.phone}`, icon: '📱' },
                    { label: 'Email', value: user.email, icon: '📧' },
                    { label: 'Password', value: '••••••••', icon: '🔒' },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                      <span className="text-xl">{field.icon}</span>
                      <div>
                        <p className="text-xs text-surface-400">{field.label}</p>
                        <p className="text-sm font-medium text-surface-800">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-surface-900">Delivery Address</h2>
                {!isEditingAddress && (
                  <button onClick={startEditAddress} className="text-sm text-primary-600 font-semibold hover:underline">
                    ✏️ Edit
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Address Line 1</label>
                    <input type="text" value={editAddr1} onChange={(e) => setEditAddr1(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Address Line 2</label>
                    <input type="text" value={editAddr2} onChange={(e) => setEditAddr2(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-600 mb-1">City</label>
                      <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-600 mb-1">PIN Code</label>
                      <input type="text" value={editPincode} onChange={(e) => setEditPincode(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">State</label>
                    <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1">Landmark</label>
                    <input type="text" value={editLandmark} onChange={(e) => setEditLandmark(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveAddress} className="btn-primary px-6 py-2.5 rounded-xl text-sm">Save</button>
                    <button onClick={() => setIsEditingAddress(false)} className="px-6 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-surface-50 rounded-2xl border border-surface-100">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🏠</span>
                    <div className="text-sm text-surface-700 leading-relaxed">
                      <p className="font-semibold text-surface-900">{user.fullName}</p>
                      <p>{user.address.addressLine1}</p>
                      {user.address.addressLine2 && <p>{user.address.addressLine2}</p>}
                      <p>{user.address.city}, {user.address.state} - {user.address.pincode}</p>
                      {user.address.landmark && <p className="text-surface-400">Landmark: {user.address.landmark}</p>}
                      <p className="mt-1 text-surface-500">📱 +91 {user.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-surface-100 p-8 text-center"
            >
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-display font-semibold text-surface-700 mb-2">
                No orders yet
              </h3>
              <p className="text-surface-400 text-sm mb-6">
                When you place an order, it will appear here
              </p>
              <Link href="/" className="btn-primary inline-block px-6 py-3 rounded-xl text-sm">
                Start Shopping
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            🚪 Logout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
