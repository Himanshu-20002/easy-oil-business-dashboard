'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, Fuel, ShieldCheck } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'sales_officer':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
            Sales Officer
          </span>
        );
      case 'customer':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
            Customer
          </span>
        );
      case 'transporter':
        return (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">
            Transporter
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-md shadow-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">EasyOil</span>
              <span className="text-xs bg-iocl-orange text-slate-950 px-2 py-1 rounded-lg font-bold uppercase">B2B</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Onboarding Portal</p>
          </div>
        </div>

        {session?.user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-100">{session.user.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                {getRoleBadge(session.user.role as string)}
                <span className="text-xs text-slate-400 font-medium">{session.user.email}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden sm:block" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-600 transition-all text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
