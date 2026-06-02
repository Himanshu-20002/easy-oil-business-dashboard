'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../../components/brand/Header';
import { Footer } from '../../../components/brand/Footer';
import { 
  ClipboardList, Search, 
  FileText, Download, 
  Check, X, Loader2, RefreshCw 
} from 'lucide-react';

export default function OfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Action details
  const [remarkText, setRemarkText] = useState('');
  const [docVerifications, setDocVerifications] = useState<Record<string, { status: string; comment: string }>>({});

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/officer/applications');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load officer workspace');
      
      setApplications(data.applications || []);
      setOfficers(data.officers || []);
      setDocuments(data.documents || []);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectApp = (app: any) => {
    setSelectedApp(app);
    setRemarkText('');
    
    // Pre-populate document verifications
    const appDocs = documents.filter((d: any) => d.applicationRef === app._id);
    const verifications: Record<string, { status: string; comment: string }> = {};
    appDocs.forEach((d: any) => {
      verifications[d._id] = {
        status: d.verificationStatus || 'pending',
        comment: d.comments || ''
      };
    });
    setDocVerifications(verifications);
  };

  const handleDocVerifyChange = (docId: string, status: string) => {
    setDocVerifications(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        status
      }
    }));
  };

  const handleDocCommentChange = (docId: string, comment: string) => {
    setDocVerifications(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        comment
      }
    }));
  };

  const handleUpdateWorkflow = async (newStatus: string) => {
    if (!selectedApp) return;
    setUpdating(true);

    try {
      // Prepare document updates list
      const appDocs = documents.filter((d: any) => d.applicationRef === selectedApp._id);
      const documentUpdates = appDocs.map((d: any) => ({
        docId: d._id,
        verificationStatus: docVerifications[d._id]?.status || 'pending',
        comments: docVerifications[d._id]?.comment || ''
      }));

      const res = await fetch('/api/officer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          status: newStatus,
          remarkText,
          documentUpdates
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Workflow update failed');

      // Refresh data
      await fetchDashboardData();
      setSelectedApp(null);
      alert('Application updated successfully!');
    } catch (err: any) {
      alert(err.message || 'An error occurred during workflow update');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignOfficer = async (officerId: string) => {
    if (!selectedApp) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/officer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          assignedOfficerId: officerId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Officer assignment failed');

      await fetchDashboardData();
      // Update selected app ref
      setSelectedApp((prev: any) => prev ? ({ ...prev, assignedOfficer: officers.find(o => o._id === officerId) }) : null);
      alert('Sales officer assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-200 uppercase">Approved</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 uppercase">Rejected</span>;
      case 'correction_required':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">Correction Req</span>;
      case 'under_review':
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-200 uppercase">Under Review</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200 uppercase">{status}</span>;
    }
  };

  const filteredApps = applications.filter((app: any) => {
    const query = search.toLowerCase();
    const companyName = app.companyRef?.companyName?.toLowerCase() || '';
    const appId = app.applicationId?.toLowerCase() || '';
    const status = app.status || '';

    const matchesSearch = companyName.includes(query) || appId.includes(query);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedAppDocs = selectedApp ? documents.filter((d: any) => d.applicationRef === selectedApp._id) : [];

  // Calculate quick metrics
  const totalCount = applications.length;
  const submittedCount = applications.filter(a => a.status === 'submitted').length;
  const reviewCount = applications.filter(a => a.status === 'under_review').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-iocl-blue animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Officer Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Officer Workspace</h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">Review onboarding compliance, verify GST/PAN credentials, and approve deals.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Statistics Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bulk Deals</span>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] text-iocl-orange font-bold uppercase tracking-wider">New Submissions</span>
            <p className="text-2xl font-extrabold text-iocl-orange mt-1">{submittedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Under Active Review</span>
            <p className="text-2xl font-extrabold text-sky-600 mt-1">{reviewCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Deals Approved</span>
            <p className="text-2xl font-extrabold text-green-600 mt-1">{approvedCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by Company name or IOCL ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All States</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="correction_required">Correction Required</option>
              <option value="approved">Approved</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Applications list table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-iocl-blue" />
                Onboarding Submissions
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Click Review to open the full application workspace.</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px]">
                <th className="py-3 px-2">IOCL ID</th>
                <th className="py-3 px-2">Corporate Partner</th>
                <th className="py-3 px-2">Fuel Specifications</th>
                <th className="py-3 px-2">Verification status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 font-bold text-slate-800">{app.applicationId}</td>
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-900">{app.companyRef?.companyName || 'Unknown Corp'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{app.companyRef?.state || 'N/A'} • GST: {app.companyRef?.gst || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-800">{app.productType || 'Unknown'} ({Number(app.quantity || 0).toLocaleString()} L)</p>
                    </td>
                    <td className="py-4 px-2">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleSelectApp(app)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-[10px] font-bold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No applications match criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedApp && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Application Review</span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedApp.applicationId}</h3>
                <p className="text-sm text-slate-600">{selectedApp.companyRef?.companyName || 'Unknown Corporate Partner'}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-[11px] text-slate-700 font-semibold border border-slate-200">
                  Assigned Officer: <span className="font-bold text-slate-900">{selectedApp.assignedOfficer?.name || 'Unassigned'}</span>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                >
                  Back to Submissions
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
              <div className="space-y-3 rounded-3xl bg-slate-50 p-5 border border-slate-200">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Partner Details</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div>
                    <p className="text-slate-500">GST</p>
                    <p className="font-semibold">{selectedApp.companyRef?.gst || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">PAN</p>
                    <p className="font-semibold">{selectedApp.companyRef?.pan || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">State</p>
                    <p className="font-semibold">{selectedApp.companyRef?.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-semibold">{selectedApp.companyRef?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-semibold">{selectedApp.companyRef?.mobile || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl bg-slate-50 p-5 border border-slate-200 xl:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Application Summary</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div>
                    <p className="text-slate-500">Product</p>
                    <p className="font-semibold">{selectedApp.productType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Quantity</p>
                    <p className="font-semibold">{Number(selectedApp.quantity || 0).toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Company Type</p>
                    <p className="font-semibold">{selectedApp.companyRef?.firmType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Submission Date</p>
                    <p className="font-semibold">{selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Lead Source</p>
                    <p className="font-semibold">{selectedApp.leadSource || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Current Review Stage</p>
                    <p className="font-semibold">{selectedApp.status ? selectedApp.status.replace('_', ' ') : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Uploaded Documents</h4>
                  <p className="text-[11px] text-slate-500">Review and verify the scanned uploads for this application.</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedAppDocs.length > 0 ? selectedAppDocs.map((doc) => (
                  <div key={doc._id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 rounded-3xl border border-slate-200 bg-slate-50">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900 capitalize">{doc.fileType.replace('_', ' ')}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>Current: {doc.verificationStatus || 'pending'}</span>
                        <a href={doc.fileUrl} target="_blank" className="text-iocl-blue font-bold hover:underline">View Copy</a>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDocVerifyChange(doc._id, 'verified')}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold border ${docVerifications[doc._id]?.status === 'verified' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        <Check className="w-3 h-3 inline-block mr-1" /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDocVerifyChange(doc._id, 'rejected')}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold border ${docVerifications[doc._id]?.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        <X className="w-3 h-3 inline-block mr-1" /> Reject
                      </button>
                    </div>
                    {docVerifications[doc._id]?.status === 'rejected' && (
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={docVerifications[doc._id]?.comment || ''}
                          onChange={(e) => handleDocCommentChange(doc._id, e.target.value)}
                          className="block w-full px-3 py-2 border border-red-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No documents were uploaded for this application.</div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Officer Remarks</p>
                <textarea
                  rows={4}
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Provide audit feedback or instructions..."
                  className="block w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Review actions</p>
                  <p className="text-sm text-slate-600">Update application status and submit your decision.</p>
                </div>
                <div className="grid gap-3">
                  <button
                    onClick={() => handleUpdateWorkflow('correction_required')}
                    disabled={updating}
                    className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600"
                  >
                    Request Corrections
                  </button>
                  <button
                    onClick={() => handleUpdateWorkflow('approved')}
                    disabled={updating}
                    className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Approve Deal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
