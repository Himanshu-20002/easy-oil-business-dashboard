'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isApproved?: boolean;
}

export function DashboardLayout({ children, isApproved = true }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Suspense fallback={<div className="w-64 bg-slate-900" />}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isApproved={isApproved} />
      </Suspense>

      <main className="flex-1 flex flex-col">
        {/* Top bar for mobile */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-900" />
          </button>
          <div className="font-bold text-slate-900">EasyOil Dashboard</div>
          <div className="w-9" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
