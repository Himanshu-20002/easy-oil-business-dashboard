'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { Card } from '../../../components/dashboard/Card';
import { Badge } from '../../../components/dashboard/Badge';
import { Loader2, User, Building2, CheckCircle2 } from 'lucide-react';

function SettingsContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile fields state
  const [companyName, setCompanyName] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/applications/current');
        const json = await res.json();
        if (res.ok && json.success && json.company) {
          const c = json.company;
          setCompanyName(c.companyName || '');
          setGst(c.gst || '');
          setPan(c.pan || '');
          setAddress(c.address || '');
          setDistrict(c.district || '');
          setState(c.state || '');
          setPincode(c.pincode || '');
          setContactPerson(c.contactPerson || '');
          setMobile(c.mobile || '');
          setEmail(c.email || '');
          setCreditLimit(c.creditLimit || 500000);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          address,
          district,
          state,
          pincode,
          contactPerson,
          mobile,
          email
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToastMessage('Profile settings updated successfully in MongoDB!');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(json.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 text-xs border border-slate-700 animate-slide-in">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-[10px]">✓</div>
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Account & Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure company profiles, contact parameters, and view credit limits.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Editor Cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Company Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Registered Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">GST Identification Number (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={gst}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Company PAN (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={pan}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Office Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Contact Person Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Authorized Signatory Name</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Primary Phone Contact</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Billing Notification Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Info Panel */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-0">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Verification Details</h3>
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">KYC Status</span>
                <Badge variant="success" size="sm">✓ APPROVED</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Assigned Limit</span>
                <span className="font-bold text-slate-100">{formatCurrency(creditLimit)}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
                To request adjustments to verification limits or correct statutory GST/PAN details, please contact corporate admin channels.
              </p>
            </div>
          </Card>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              'Save Profile Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold text-sm">Loading Settings...</p>
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  );
}
