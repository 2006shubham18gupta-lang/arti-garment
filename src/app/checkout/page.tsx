'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { useOrders } from '@/store/OrderContext';
import { DeliveryAddress, OrderItem } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, dispatch, cartTotal, cartCount } = useStore();
  const { state: authState } = useAuth();
  const { placeOrder } = useOrders();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Success
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: authState.user?.fullName || '',
    phone: authState.user?.phone || '',
    alternatePhone: '',
    address: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
  });

  const deliveryCharge = cartTotal >= 999 ? 0 : 49;
  const grandTotal = cartTotal + deliveryCharge;

  // Redirect if not logged in
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-display font-bold text-surface-800 mb-2">Login Required</h1>
          <p className="text-surface-500 mb-6">Order place karne ke liye pehle login karein</p>
          <Link href="/login" className="btn-primary inline-block px-8 py-3 rounded-xl">
            Login Karein
          </Link>
        </motion.div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (state.cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-display font-bold text-surface-800 mb-2">Cart Khaali Hai</h1>
          <p className="text-surface-500 mb-6">Pehle kuch products cart mein add karein</p>
          <Link href="/" className="btn-primary inline-block px-8 py-3 rounded-xl">
            Shopping Karein
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setOrderError('');
    try {
      const orderItems: OrderItem[] = state.cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));

      const id = await placeOrder(
        orderItems,
        address,
        grandTotal,
        authState.user?.email || 'guest',
        authState.user?.fullName || 'Guest',
        authState.user?.email || ''
      );

      setOrderId(id);
      dispatch({ type: 'CLEAR_CART' });
      setStep(3);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Checkout error:', errorMessage);
      setOrderError(errorMessage);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Steps */}
        {step !== 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            {[
              { num: 1, label: 'Delivery Address' },
              { num: 2, label: 'Review & Pay' },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s.num
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'bg-surface-200 text-surface-500'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-primary-600' : 'text-surface-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i === 0 && (
                  <div className={`w-16 sm:w-24 h-0.5 rounded-full transition-all ${
                    step > 1 ? 'bg-primary-600' : 'bg-surface-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-surface-100 p-6 md:p-8">
                  <h2 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2">
                    📍 Delivery Address
                  </h2>
                  
                  <form onSubmit={handleAddressSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={e => setAddress(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Aapka naam"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={e => setAddress(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="10-digit mobile number"
                          pattern="[0-9]{10}"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Alternate Phone (Optional)</label>
                        <input
                          type="tel"
                          value={address.alternatePhone}
                          onChange={e => setAddress(prev => ({ ...prev, alternatePhone: e.target.value }))}
                          placeholder="Alternate number (optional)"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Address *</label>
                        <textarea
                          value={address.address}
                          onChange={e => setAddress(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="House no., Street, Mohalla, Landmark"
                          rows={3}
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">City *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Atarra, Banda"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">State *</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={e => setAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Uttar Pradesh"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Pincode *</label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={e => setAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="210201"
                          pattern="[0-9]{6}"
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-primary py-3.5 px-8 rounded-xl text-base w-full sm:w-auto">
                        Continue to Review →
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div>
                <div className="bg-white rounded-3xl border border-surface-100 p-6 sticky top-28">
                  <h3 className="text-lg font-display font-bold text-surface-900 mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                    {state.cart.map(item => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-surface-400">{item.selectedSize} · ×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-surface-700">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-surface-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Subtotal ({cartCount} items)</span>
                      <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Delivery</span>
                      <span className={`font-medium ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-display font-bold pt-2 border-t border-surface-100">
                      <span>Total</span>
                      <span className="text-primary-700">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review & Pay */}
          {step === 2 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address Review */}
                <div className="bg-white rounded-3xl border border-surface-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-bold text-surface-900 flex items-center gap-2">
                      📍 Delivery Address
                    </h3>
                    <button onClick={() => setStep(1)} className="text-sm text-primary-600 font-medium hover:underline">
                      Change
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-2xl p-4">
                    <p className="font-semibold text-surface-800">{address.fullName}</p>
                    <p className="text-sm text-surface-600 mt-1">{address.address}</p>
                    <p className="text-sm text-surface-600">{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-sm text-surface-500 mt-1">📞 {address.phone}</p>
                    {address.alternatePhone && (
                      <p className="text-sm text-surface-500">📞 {address.alternatePhone} (alternate)</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-3xl border border-surface-100 p-6">
                  <h3 className="text-lg font-display font-bold text-surface-900 mb-4">🛍️ Order Items</h3>
                  <div className="space-y-4">
                    {state.cart.map(item => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4 p-3 rounded-2xl bg-surface-50">
                        <div className="w-20 h-20 rounded-xl bg-white overflow-hidden flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-surface-800">{item.product.name}</p>
                          <p className="text-sm text-surface-400 mt-0.5">
                            Size: {item.selectedSize} · Color: {item.selectedColor} · Qty: {item.quantity}
                          </p>
                          <p className="font-bold text-primary-700 mt-1">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-3xl border border-surface-100 p-6">
                  <h3 className="text-lg font-display font-bold text-surface-900 mb-4">💳 Payment Method</h3>
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white text-lg">
                      💵
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Cash on Delivery (COD)</p>
                      <p className="text-xs text-green-600">Delivery ke time paisa dein</p>
                    </div>
                    <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Sidebar */}
              <div>
                <div className="bg-white rounded-3xl border border-surface-100 p-6 sticky top-28">
                  <h3 className="text-lg font-display font-bold text-surface-900 mb-4">Payment Summary</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Items ({cartCount})</span>
                      <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Delivery</span>
                      <span className={`font-medium ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-display font-bold pt-3 border-t border-surface-100">
                      <span>Total</span>
                      <span className="text-primary-700">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                    className={`w-full py-4 rounded-2xl font-display font-bold text-base transition-all duration-300 ${
                      isPlacing
                        ? 'bg-surface-300 text-surface-500 cursor-not-allowed'
                        : 'btn-primary hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    {isPlacing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Place Order · ₹${grandTotal.toLocaleString()}`
                    )}
                  </button>

                  <p className="text-xs text-surface-400 text-center mt-3">
                    Order confirm hone ke baad hum aapko call karenge 📞
                  </p>

                  {orderError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-sm font-semibold text-red-700 mb-1">❌ Order Failed</p>
                      <p className="text-xs text-red-600 whitespace-pre-wrap">{orderError}</p>
                      <button
                        onClick={() => setOrderError('')}
                        className="mt-2 text-xs text-red-500 underline hover:text-red-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="bg-white rounded-3xl border border-surface-100 p-8 md:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6"
                >
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
                  Order Successfully Placed! 🎉
                </h1>
                <p className="text-surface-500 mb-6">
                  Aapka order receive ho gaya hai. Hum jald hi aapko call karke confirm karenge.
                </p>

                <div className="bg-surface-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-surface-500">Order ID</p>
                  <p className="font-mono font-bold text-primary-700 text-lg">{orderId}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      ⏳ Pending Confirmation
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-blue-700 font-medium">
                    💡 Payment Method: Cash on Delivery<br />
                    Delivery ke time ₹{grandTotal.toLocaleString()} dena hoga
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="flex-1 py-3 px-6 btn-primary rounded-xl text-center text-sm">
                    Continue Shopping
                  </Link>
                  <Link href="/profile" className="flex-1 py-3 px-6 bg-surface-100 text-surface-700 rounded-xl text-center text-sm font-medium hover:bg-surface-200 transition-colors">
                    View My Orders
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
