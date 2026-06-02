import React from 'react';
import Link from 'next/link';
import { Fuel, Mail, Phone, ShieldCheck, MapPin, Globe, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 py-16 relative overflow-hidden">
      {/* Subtle glow behind the footer */}
      <div className="absolute bottom-[-10%] left-[5%] w-[40%] h-[30%] rounded-full bg-iocl-blue/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Links & Branding Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl iocl-gradient-orange flex items-center justify-center text-white shadow-md shadow-iocl-orange/10">
                <Fuel className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block leading-none">EasyOil</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Onboarding Portal</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              Providing digital efficiency to industrial & commercial fuel distribution networks. Secure documentation vetting, automated allocations, and real-time status management.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-iocl-orange" />
                ISO 27001 SECURE
              </span>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Products</h5>
            <ul className="space-y-2 text-xs font-bold">
              <li><a href="#" className="hover:text-iocl-orange transition-colors flex items-center gap-1">High Speed Diesel <ArrowUpRight className="w-3 h-3 text-slate-600" /></a></li>
              <li><a href="#" className="hover:text-iocl-orange transition-colors flex items-center gap-1">Light Diesel Oil <ArrowUpRight className="w-3 h-3 text-slate-600" /></a></li>
              <li><a href="#" className="hover:text-iocl-orange transition-colors flex items-center gap-1">Bitumen & Asphalts <ArrowUpRight className="w-3 h-3 text-slate-600" /></a></li>
            </ul>
          </div>

          {/* Portals Links Column */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Portals</h5>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/customer/dashboard" className="hover:text-iocl-blue transition-colors">Customer Portal</Link></li>
              <li><Link href="/officer/dashboard" className="hover:text-iocl-blue transition-colors">Sales Officer Panel</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-iocl-blue transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Corporate Support Column */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Intake Support</h5>
            
            <div className="space-y-2.5 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-iocl-orange shrink-0" />
                <span>1800-233-3555 (Toll-Free Helpline)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-iocl-orange shrink-0" />
                <span>helpdesk.b2b@easyoil.in</span>
              </div>
              {/* <div className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-iocl-orange shrink-0" />
                <span className="text-slate-500 font-semibold leading-normal">
                  EasyOil Corporation Limited, Bandra East, Mumbai - 400051.
                </span>
              </div> */}
            </div>
          </div>

        </div>

        {/* Bottom copyright & legal compliance line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-500">
          <p>© {currentYear} EasyOil Corporation Limited. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-slate-800">•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <span className="text-slate-800">•</span>
            <a href="#" className="hover:text-white transition-colors">Help Desk</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
