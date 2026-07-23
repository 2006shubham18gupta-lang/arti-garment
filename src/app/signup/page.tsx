'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state_, setState_] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (addressLine1.trim().length < 5) {
      setError('Please enter your complete address');
      return;
    }
    if (city.trim().length < 2) {
      setError('Please enter your city/village name');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      const result = await signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        address: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: state_.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
        },
      });

      if (result.success) {
        setStep(3);
        setTimeout(() => router.push('/'), 2500);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Signup failed. Please check your connection and try again.');
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Live Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-rose-600 to-amber-500 rounded-full blur-[140px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-luxury font-bold text-3xl shadow-2xl shadow-indigo-500/30 mb-4">
              A
            </div>
          </Link>
          <h1 className="text-3xl font-luxury font-bold text-white tracking-wide">Create Your Account</h1>
          <p className="text-slate-400 mt-1 text-xs uppercase tracking-widest font-semibold">Join Arti Garment for the best shopping experience</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: step >= s ? (s === 3 ? '#22c55e' : '#6366f1') : 'rgba(255,255,255,0.08)',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 transition-colors"
                style={{
                  borderColor: step >= s ? (s === 3 ? '#22c55e' : '#6366f1') : 'rgba(255,255,255,0.15)',
                }}
              >
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </motion.div>
              {s < 3 && (
                <div className={`w-12 h-0.5 rounded-full transition-colors ${step > s ? 'bg-indigo-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-center gap-8 mb-6 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          <span className={step >= 1 ? 'text-slate-300' : ''}>Personal Info</span>
          <span className={step >= 2 ? 'text-slate-300' : ''}>Address</span>
          <span className={step >= 3 ? 'text-emerald-400' : ''}>Complete ✓</span>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl glass-dark border border-white/10 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1}
                className="p-6 md:p-8 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-luxury font-bold text-white">Personal Details</h2>
                  <p className="text-xs text-slate-400">Tell us about yourself</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-sm text-rose-300 flex items-center gap-2"
                  >
                    <span>⚠️</span> {error}
                  </motion.div>
                )}

                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98XXXXXXXX"
                      className={`${inputClass} pl-14`}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`${inputClass} pr-12`}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={inputClass}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 btn-primary rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl"
                >
                  Next Step →
                </button>

                <p className="text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                    Login
                  </Link>
                </p>
              </motion.form>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep2}
                className="p-6 md:p-8 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-luxury font-bold text-white">Delivery Address</h2>
                  <p className="text-xs text-slate-400">Where should we deliver your orders?</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-sm text-rose-300 flex items-center gap-2"
                  >
                    <span>⚠️</span> {error}
                  </motion.div>
                )}

                <div>
                  <label className={labelClass}>Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House No., Street, Locality"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Address Line 2</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Ward, Block (optional)"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City / Village *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Atarra"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PIN Code *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="210201"
                      className={inputClass}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>State *</label>
                  <select
                    value={state_}
                    onChange={(e) => setState_(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Landmark (optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby famous place"
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="px-6 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 btn-primary rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl"
                  >
                    Create Account ✨
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6"
                >
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-luxury font-bold text-white mb-2">
                  🎉 Welcome, {fullName}!
                </h2>
                <p className="text-slate-300 mb-2 text-sm">
                  Your account has been created successfully.
                </p>
                <p className="text-xs text-slate-500">
                  Redirecting to homepage...
                </p>
                <div className="mt-6">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
