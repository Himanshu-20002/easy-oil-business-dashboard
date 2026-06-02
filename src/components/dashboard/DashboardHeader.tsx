import React, { useState } from 'react';
import { Badge } from './Badge';
import { Bell, User, X, Check } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  companyName?: string;
  status?: string; // 'draft' | 'submitted' | 'under_review' | 'correction_required' | 'approved' | 'rejected'
  alerts?: any[];
  onDismissAlert?: (id: any) => void;
}

export function DashboardHeader({ 
  companyName = 'Fuel Solutions Inc',
  status = 'approved',
  alerts = [],
  onDismissAlert
}: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const activeAlerts = alerts.filter(a => !a.dismissed);

  // Helper to render badges based on onboarding status
  const renderStatusBadges = () => {
    switch (status) {
      case 'approved':
        return (
          <>
            <Badge variant="success" size="sm">
              ✓ Account Active / Approved
            </Badge>
            <Badge variant="info" size="sm">
              ✓ KYC Verified
            </Badge>
            <Badge variant="success" size="sm">
              ✓ GST Verified
            </Badge>
          </>
        );
      case 'submitted':
      case 'under_review':
        return (
          <>
            <Badge variant="warning" size="sm">
              ⧖ Application Submitted / Under Review
            </Badge>
            <Badge variant="info" size="sm">
              ○ KYC Verification Pending
            </Badge>
          </>
        );
      case 'correction_required':
        return (
          <>
            <Badge variant="error" size="sm">
              ⚠ Action Required: Correction Needed
            </Badge>
            <Badge variant="warning" size="sm">
              ⚠ Update KYC / Application Form
            </Badge>
          </>
        );
      case 'rejected':
        return (
          <>
            <Badge variant="error" size="sm">
              ✕ Application Rejected
            </Badge>
          </>
        );
      case 'draft':
      default:
        return (
          <>
            <Badge variant="default" size="sm">
              ○ Draft - Form Unsubmitted
            </Badge>
            <Badge variant="info" size="sm">
              ➔ Action: Complete Registration Form
            </Badge>
          </>
        );
    }
  };

  return (
    <div className="mb-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Welcome back, <span className="text-blue-600">{companyName}</span>
          </h1>
          <p className="text-slate-600 mt-2">Manage your fuel procurement and business operations</p>
        </div>

        {/* User menu and notifications */}
        <div className="flex items-center gap-3 relative z-30">
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-6 h-6 text-slate-600" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-zoom-in z-50">
                <div className="bg-slate-900 text-white p-3 flex items-center justify-between text-xs">
                  <span className="font-bold">Notifications Center</span>
                  <button 
                    onClick={() => setShowDropdown(false)}
                    className="p-1 hover:bg-slate-800 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {activeAlerts.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 text-xs">All clear! No pending notifications.</p>
                  ) : (
                    activeAlerts.map((alert) => (
                      <div key={alert._id || alert.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 font-semibold leading-relaxed">{alert.message}</p>
                          <span className={`text-[9px] font-bold uppercase mt-1 inline-block ${
                            alert.priority === 'error' ? 'text-red-500' : alert.priority === 'warning' ? 'text-amber-500' : 'text-blue-500'
                          }`}>
                            {alert.priority} priority
                          </span>
                        </div>
                        <button
                          onClick={() => onDismissAlert?.(alert._id || alert.id)}
                          className="p-1 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded transition-colors"
                          title="Mark Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link 
                    href="/customer/dashboard?tab=overview" 
                    onClick={() => setShowDropdown(false)}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    View All Alerts
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/customer/settings" 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Profile & Settings"
          >
            <User className="w-6 h-6 text-slate-600" />
          </Link>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-3">
        {renderStatusBadges()}
      </div>
    </div>
  );
}
