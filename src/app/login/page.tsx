'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Fuel, Lock, Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Handle seed success info or next auth error params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email address or password. Please try again.');
    } else if (errorParam) {
      setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  const triggerSeed = async () => {
    setSeeding(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Seeding failed');
      setSuccess('Database seeded successfully!');
    } catch (err: any) {
      setError(err.message || 'Seeding error');
    } finally {
      setSeeding(false);
    }
  };

  const performLogin = async (emailStr: string, passwordStr: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        email: emailStr.toLowerCase(),
        password: passwordStr,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid credentials or inactive account.');
        setLoading(false);
        return false;
      }

      setSuccess('Successfully authenticated! Routing to workspace...');
      
      // Fetch session dynamically to redirect straight to their respective dashboard
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      
      let redirectTo = callbackUrl;
      if (!redirectTo || redirectTo === '/' || redirectTo === '/login') {
        const role = session?.user?.role;
        if (role === 'admin') {
          redirectTo = '/admin/dashboard';
        } else if (role === 'sales_officer') {
          redirectTo = '/officer/dashboard';
        } else {
          redirectTo = '/customer/dashboard';
        }
      }

      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1000);
      return true;
    } catch (err: any) {
      setError('An error occurred during login. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    await performLogin(email, password);
  };

  const handleQuickLogin = async (emailStr: string) => {
    const seededPassword = 'iocl1234';
    setEmail(emailStr);
    setPassword(seededPassword);
    await performLogin(emailStr, seededPassword);
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
          Sign In to Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          New industrial partner?{' '}
          <Link href="/register" className="font-bold text-iocl-orange hover:text-iocl-orange/80 transition-colors">
            Register your B2B account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-800/80 border border-slate-700 backdrop-blur-md py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-5 bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Official Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium transition-all"
                  placeholder="name@easyoil.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white font-extrabold text-sm iocl-gradient-orange shadow-lg hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-all iocl-glow-orange"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Credentials Panel (BETA seeded accounts) */}
          <div className="mt-8 border-t border-slate-700/60 pt-6">
            <div className="flex items-center gap-1.5 mb-3 text-slate-300">
              <HelpCircle className="w-4.5 h-4.5 text-iocl-orange" />
              <span className="text-xs font-bold uppercase tracking-wider">BETA Seeded Login Credentials — click to auto-login</span>
            </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@easyoil.in')}
                    className="px-2.5 py-1 bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-900/60 text-[10px] font-bold rounded-lg transition-colors"
                  >
                    Admin: admin@easyoil.in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('officer1@easyoil.in')}
                    className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-950/60 text-blue-300 border border-blue-900/60 text-[10px] font-bold rounded-lg transition-colors"
                  >
                    Officer 1: officer1@easyoil.in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('customerC@chromapolymers.com')}
                    className="px-2.5 py-1 bg-green-950/40 hover:bg-green-950/60 text-green-300 border border-green-900/60 text-[10px] font-bold rounded-lg transition-colors"
                  >
                    Customer: customerC@chromapolymers.com
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold italic mt-1.5 flex items-center gap-1">
                  * Note: Password for seeded accounts is <strong className="text-slate-400">iocl1234</strong>. Trigger 
                  <button 
                    type="button" 
                    onClick={triggerSeed} 
                    disabled={seeding}
                    className="underline text-iocl-blue hover:text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {seeding ? 'seeding...' : 'seeding first'}
                  </button> 
                  if database is empty!
                </p>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100 font-bold text-sm">Loading EasyOil Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
