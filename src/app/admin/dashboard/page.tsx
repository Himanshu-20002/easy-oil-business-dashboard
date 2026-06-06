'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../../components/brand/Header';
import { Footer } from '../../../components/brand/Footer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Shield, Users, ClipboardList, Database, Download, 
  FileText, Activity, Loader2, RefreshCw, CheckCircle, Truck
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'customers' | 'transporters' | 'notifications'>('customers');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Broadcast Center states
  const [companies, setCompanies] = useState<any[]>([]);
  const [sentAlerts, setSentAlerts] = useState<any[]>([]);
  const [msgText, setMsgText] = useState('');
  const [alertPriority, setAlertPriority] = useState('info');
  const [isGlobalAlert, setIsGlobalAlert] = useState(true);
  const [targetCompany, setTargetCompany] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/officer/applications'); // Re-use officer applications list for Admin
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error fetching details');
      setData(json);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTransporters = async () => {
    try {
      const res = await fetch('/api/admin/transporters');
      const json = await res.json();
      if (res.ok) {
        setTransporters(json.transporters || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlertsData = async () => {
    try {
      const res = await fetch('/api/admin/alerts');
      const json = await res.json();
      if (res.ok && json.success) {
        setCompanies(json.companies || []);
        setSentAlerts(json.alerts || []);
        if (json.companies && json.companies.length > 0 && !targetCompany) {
          setTargetCompany(json.companies[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchAdminData(), fetchTransporters(), fetchAlertsData()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingAlert(true);
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          priority: alertPriority,
          isGlobal: isGlobalAlert,
          companyRef: isGlobalAlert ? undefined : targetCompany
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert('Notification broadcasted successfully!');
        setMsgText('');
        await fetchAlertsData();
      } else {
        alert(json.message || 'Failed to send notification');
      }
    } catch (err: any) {
      alert('Error sending alert: ' + err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      const res = await fetch(`/api/admin/alerts?alertId=${alertId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchAlertsData();
      } else {
        alert(json.message || 'Failed to delete alert');
      }
    } catch (err: any) {
      alert('Error deleting alert: ' + err.message);
    }
  };

  const triggerSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Seeding failed');
      alert(json.message);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Seeding error');
    } finally {
      setSeeding(false);
    }
  };

  const handleTransporterStatus = async (transporterId: string, status: string) => {
    setActionLoading(transporterId);
    try {
      const res = await fetch('/api/admin/transporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporterId, status })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update status');
      alert(json.message);
      await fetchTransporters();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Dynamically export report
  const triggerExport = async (format: 'excel' | 'pdf') => {
    try {
      const { exportToExcel, exportToPDF } = await import('../../../services/exportServices');
      if (format === 'excel') {
        exportToExcel(data?.applications || []);
      } else {
        exportToPDF(data?.applications || []);
      }
    } catch (err: any) {
      alert('Error during report generation: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-iocl-blue animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Executive Administration...</p>
      </div>
    );
  }

  const { applications, officers } = data || {};

  // Process data for charts
  const statusCounts: Record<string, number> = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    correction_required: 0,
    approved: 0,
    rejected: 0
  };

  applications?.forEach((app: any) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  });

  const barData = Object.keys(statusCounts).map(status => ({
    name: status.toUpperCase().replace('_', ' '),
    count: statusCounts[status]
  }));

  const COLORS = ['#94a3b8', '#f97316', '#0284c7', '#eab308', '#22c55e', '#ef4444'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Title and config buttons */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">IOCL Executive Control Room</h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">Platform analytics, sales officer workflows, audit trails, and reporting services.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={triggerSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Database className="w-4 h-4" /> {seeding ? 'Seeding...' : 'Reset & Seed Database'}
            </button>
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-iocl-blue/10 text-iocl-blue flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Deals</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{applications?.length || 0}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-iocl-orange/10 text-iocl-orange flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sales Officers</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{officers?.length || 0}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Partners</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{statusCounts.approved}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transporters</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{transporters.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'customers' ? 'border-iocl-blue text-iocl-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Customer Onboarding
          </button>
          <button
            onClick={() => setActiveTab('transporters')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'transporters' ? 'border-iocl-blue text-iocl-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Transporter Approvals
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'notifications' ? 'border-iocl-blue text-iocl-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Broadcast Center
          </button>
        </div>

        {activeTab === 'customers' && (
          <>
            {/* Charts & Interactive Reporting Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Partner Onboarding Pipeline</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" fill="#0054A6" radius={[4, 4, 0, 0]} maxBarSize={45}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Reporting Services</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Download structured data streams compiling partner profiles, verified compliance flags, logistics requirements, and assigned officer pipelines.
                  </p>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => triggerExport('excel')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-green-600" /> Excel Spreadsheet Report
                      </span>
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => triggerExport('pdf')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-4.5 h-4.5 text-red-600" /> PDF Executive Audit Report
                      </span>
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-semibold text-center italic mt-6 border-t border-slate-100 pt-4">
                  * Reports are compiled live from active MongoDB databases.
                </p>
              </div>
            </div>

            {/* Administration Table list */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <h3 className="text-base font-extrabold text-slate-800 mb-4 uppercase tracking-wider">System-wide Customer Pipelines</h3>
              
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px]">
                    <th className="py-3 px-2">IOCL ID</th>
                    <th className="py-3 px-2">Corporate Partner</th>
                    <th className="py-3 px-2">Product Demand</th>
                    <th className="py-3 px-2">Assigned Officer</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications?.map((app: any) => (
                    <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2 font-bold text-slate-800">{app.applicationId}</td>
                      <td className="py-4 px-2">
                        <p className="font-bold text-slate-900">{app.companyRef?.companyName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{app.companyRef?.state} • Contact: {app.companyRef?.contactPerson}</p>
                      </td>
                      <td className="py-4 px-2 font-bold text-slate-800">{app.productType} ({Number(app.quantity).toLocaleString()} L)</td>
                      <td className="py-4 px-2 text-slate-500 font-semibold">{app.assignedOfficer?.name || 'Unassigned'}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${app.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'transporters' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Transporter Registry Approvals</h3>
            
            <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px]">
                  <th className="py-3 px-2">Company Name</th>
                  <th className="py-3 px-2">Owner</th>
                  <th className="py-3 px-2">Mobile</th>
                  <th className="py-3 px-2">Service Area</th>
                  <th className="py-3 px-2">Capacity</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transporters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 italic">No transporters registered yet.</td>
                  </tr>
                ) : (
                  transporters.map((t: any) => (
                    <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2 font-bold text-slate-900">{t.companyName}</td>
                      <td className="py-4 px-2 text-slate-700">{t.ownerName}<br/><span className="text-[10px] text-slate-400">{t.email}</span></td>
                      <td className="py-4 px-2 text-slate-600">{t.mobile}</td>
                      <td className="py-4 px-2 text-slate-700">{t.serviceArea}</td>
                      <td className="py-4 px-2 font-bold text-slate-800">{t.vehicleCapacity} KL</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' :
                          t.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {t.status || 'PENDING_APPROVAL'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleTransporterStatus(t._id, 'ACTIVE')}
                            disabled={actionLoading === t._id || t.status === 'ACTIVE'}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] disabled:opacity-50 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleTransporterStatus(t._id, 'REJECTED')}
                            disabled={actionLoading === t._id || t.status === 'REJECTED'}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] disabled:opacity-50 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleTransporterStatus(t._id, 'SUSPENDED')}
                            disabled={actionLoading === t._id || t.status === 'SUSPENDED'}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] disabled:opacity-50 transition-all"
                          >
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create notification form */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">Create Notification</h3>
              <form onSubmit={handleSubmitAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Alert Content</label>
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all h-28"
                    placeholder="Enter notification details (e.g. Fuel price hike updates)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Level</label>
                    <select
                      value={alertPriority}
                      onChange={(e) => setAlertPriority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Orange)</option>
                      <option value="success">Success (Green)</option>
                      <option value="error">Error (Red)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scope Target</label>
                    <select
                      value={isGlobalAlert ? 'global' : 'targeted'}
                      onChange={(e) => setIsGlobalAlert(e.target.value === 'global')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="global">Broadcast to All</option>
                      <option value="targeted">Specific Partner</option>
                    </select>
                  </div>
                </div>

                {!isGlobalAlert && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Corporate Partner</label>
                    <select
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.companyName} ({c.gst})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sendingAlert || !msgText.trim()}
                  className="w-full bg-blue-650 hover:bg-blue-750 disabled:bg-slate-200 text-white font-bold py-3.5 rounded-xl transition-colors text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  {sendingAlert ? 'Broadcasting...' : 'Broadcast Notification'}
                </button>
              </form>
            </div>

            {/* Notifications History log */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">Notification Registry & Logs</h3>
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px]">
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">Scope/Target</th>
                    <th className="py-3 px-2">Priority</th>
                    <th className="py-3 px-2">Message</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sentAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic">No alerts dispatched yet.</td>
                    </tr>
                  ) : (
                    sentAlerts.map((alert) => (
                      <tr key={alert._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">
                          {new Date(alert.createdAt || alert.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-2">
                          {alert.isGlobal ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              BROADCAST
                            </span>
                          ) : (
                            <span className="font-bold text-slate-900">
                              {alert.companyRef?.companyName || 'Unknown Partner'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                            alert.priority === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
                            alert.priority === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            alert.priority === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {alert.priority}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600 max-w-xs truncate" title={alert.message}>
                          {alert.message}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
