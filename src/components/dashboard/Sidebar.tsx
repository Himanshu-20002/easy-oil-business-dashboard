'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Fuel,
  ShoppingCart,
  Truck,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Zap,
  Lock
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/customer/dashboard?tab=overview',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'Buy Fuel',
    href: '/customer/dashboard?tab=buy-fuel',
    icon: <Fuel className="w-5 h-5" />
  },
  {
    label: 'My Orders',
    href: '/customer/dashboard?tab=orders',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    label: 'Transporter Marketplace',
    href: '/customer/dashboard?tab=transporters',
    icon: <Truck className="w-5 h-5" />
  },
  {
    label: 'Documents',
    href: '/customer/dashboard?tab=documents',
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'Analytics',
    href: '/customer/dashboard?tab=analytics',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    label: 'Services',
    href: '/customer/dashboard?tab=services',
    icon: <Zap className="w-5 h-5" />
  }
];

const bottomItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/customer/settings',
    icon: <Settings className="w-5 h-5" />
  },
  {
    label: 'FAQ',
    href: '/customer/dashboard?tab=faq',
    icon: <HelpCircle className="w-5 h-5" />
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isApproved?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isApproved = true }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const isActive = (href: string) => {
    const urlObj = new URL(href, 'http://localhost');
    const targetTab = urlObj.searchParams.get('tab');

    if (targetTab) {
      return activeTab === targetTab && pathname.includes('/customer/dashboard');
    }
    return pathname === href;
  };

  const isTabRestricted = (href: string) => {
    if (isApproved) return false;
    const urlObj = new URL(href, 'http://localhost');
    const tab = urlObj.searchParams.get('tab');
    return tab && ['buy-fuel', 'orders', 'transporters'].includes(tab);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white transform transition-transform duration-200 z-40 lg:relative lg:translate-x-0 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header with close button for mobile */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">EasyOil</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const restricted = isTabRestricted(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${restricted ? 'opacity-60 hover:bg-transparent' : ''}`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {restricted && (
                  <Lock className="w-4 h-4 ml-auto text-slate-400" />
                )}
                {!restricted && item.badge && (
                  <span className="ml-auto bg-red-500 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-slate-700" />

        {/* Bottom items */}
        <nav className="p-4 space-y-2 pb-32">
          {bottomItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onClose?.()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              FS
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Fuel Solutions</p>
              <p className="text-xs text-slate-400">Account</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
