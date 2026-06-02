'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Fuel, Building2, User, Lock, Mail, Phone, ArrowRight, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    firmType: 'Private Limited',
    gst: '',
    pan: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    contactPerson: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all personal credentials');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.gst || !formData.pan || !formData.address || !formData.state || !formData.pincode) {
      setError('Please fill in all company credentials');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(err.message || 'An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-iocl-blue/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-iocl-orange/20 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl iocl-gradient-orange flex items-center justify-center text-white shadow-xl iocl-glow-orange">
            <Fuel className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">EasyOil</span>
              <span className="text-xs bg-iocl-blue text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Enterprise</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">B2B Onboarding Portal</p>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Create B2B Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Or{' '}
          <Link href="/login" className="font-bold text-iocl-orange hover:text-iocl-orange/80 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-slate-800/80 border border-slate-700 backdrop-blur-md py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 1 ? 'bg-iocl-blue text-white iocl-glow-blue' : 'bg-green-600 text-white'}`}>
                1
              </div>
              <span className={`text-xs font-bold ${step === 1 ? 'text-white' : 'text-slate-400'}`}>Account Credentials</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 2 ? 'bg-iocl-blue text-white iocl-glow-blue' : 'bg-slate-700 text-slate-400'}`}>
                2
              </div>
              <span className={`text-xs font-bold ${step === 2 ? 'text-white' : 'text-slate-500'}`}>Company Details</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm font-semibold">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name (Contact Person)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Official Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-200 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-200 hover:text-white"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white font-extrabold text-sm iocl-gradient-orange shadow-lg hover:brightness-110 active:brightness-95 transition-all iocl-glow-orange mt-2"
              >
                Proceed to Company Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Registered Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="e.g. Apex Industrial Fuels Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Firm Type</label>
                  <select
                    name="firmType"
                    value={formData.firmType}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                  >
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">GST Number</label>
                  <input
                    type="text"
                    name="gst"
                    required
                    value={formData.gst}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all uppercase"
                    placeholder="15-digit GSTIN"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">PAN Card Number</label>
                  <input
                    type="text"
                    name="pan"
                    required
                    value={formData.pan}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all uppercase"
                    placeholder="10-digit PAN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="6-digit ZIP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Registered Office Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="Plot, Street, Building name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">District</label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3.5 px-4 rounded-xl text-white font-extrabold text-sm iocl-gradient-orange shadow-lg hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-all iocl-glow-orange flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating Account...' : 'Complete & Register'}
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
