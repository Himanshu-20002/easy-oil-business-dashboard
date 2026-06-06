'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '../../../components/brand/Header';
import { Footer } from '../../../components/brand/Footer';
import { 
  Truck, ClipboardList, Clock, CheckCircle2, AlertCircle, 
  MapPin, Calendar, Fuel, Info, Loader2, ArrowRight, Check, X
} from 'lucide-react';

export default function TransporterDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'bookings'>('requests');
  const [profileLoading, setProfileLoading] = useState(true);
  const [transporterProfile, setTransporterProfile] = useState<any>(null);
  const [fleetList, setFleetList] = useState<any[]>([]);

  // Marketplace lists
  const [requests, setRequests] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State for bidding
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidEta, setBidEta] = useState('');
  const [bidRemarks, setBidRemarks] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/transporter/profile');
      const json = await res.json();
      if (res.ok && json.success) {
        setTransporterProfile(json.transporter);
        setFleetList(json.fleet || []);
      }
    } catch (err) {
      console.error('Failed to fetch transporter profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchMarketplaceData = async () => {
    setLoadingLists(true);
    try {
      const [reqRes, quoteRes, bookingRes] = await Promise.all([
        fetch('/api/marketplace/requests'),
        fetch('/api/marketplace/quotes'),
        fetch('/api/marketplace/bookings')
      ]);

      const [reqJson, quoteJson, bookingJson] = await Promise.all([
        reqRes.json(),
        quoteRes.json(),
        bookingRes.json()
      ]);

      if (reqRes.ok && reqJson.success) {
        setRequests(
          reqJson.requests.filter(
            (r: any) => r.status === 'OPEN_FOR_BIDDING' || r.status === 'REQUEST_CREATED'
          )
        );
      }

      if (quoteRes.ok && quoteJson.success) {
        setQuotes(quoteJson.quotes || []);
      }

      if (bookingRes.ok && bookingJson.success) {
        setBookings(bookingJson.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace lists:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchProfile();
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (transporterProfile && transporterProfile.status === 'ACTIVE') {
      fetchMarketplaceData();
    }
  }, [transporterProfile]);

  const handleOpenBidModal = (req: any) => {
    setSelectedRequest(req);
    setBidAmount('');
    setBidEta('');
    setBidRemarks('');
  };

  const handleCloseBidModal = () => {
    setSelectedRequest(null);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !transporterProfile || fleetList.length === 0) return;

    setSubmittingBid(true);
    try {
      const res = await fetch('/api/marketplace/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestRef: selectedRequest._id,
          transporterRef: transporterProfile._id,
          fleetRef: fleetList[0]._id, // default default vehicle
          quotedAmount: Number(bidAmount),
          estimatedHours: Number(bidEta),
          remarks: bidRemarks
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit quote');

      alert('Quote submitted successfully!');
      handleCloseBidModal();
      fetchMarketplaceData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, nextStatus: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: nextStatus
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update status');

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, status: nextStatus } : booking
        )
      );

      alert(`Status updated to ${nextStatus}`);
      await fetchMarketplaceData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (sessionStatus === 'loading' || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-iocl-blue animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Verifying Transporter Credentials...</p>
      </div>
    );
  }

  // Handle case where transporter is pending approval
  if (transporterProfile && transporterProfile.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-iocl-orange/15 blur-[100px] pointer-events-none"></div>
          <div className="bg-slate-800/80 border border-slate-700 backdrop-blur-md p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10" />
            </div>
            
            {transporterProfile.status === 'PENDING_APPROVAL' ? (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-white mb-3">Onboarding Review in Progress</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Thank you for registering **{transporterProfile.companyName}**. Your credentials are under review by the administration. You will receive access to the bidding boards once approved.
                </p>
                <div className="bg-slate-900/50 border border-slate-700/60 p-4 rounded-2xl text-left text-xs text-slate-300 space-y-2">
                  <p><strong>Company:</strong> {transporterProfile.companyName}</p>
                  <p><strong>Owner:</strong> {transporterProfile.ownerName}</p>
                  <p><strong>Service Area:</strong> {transporterProfile.serviceArea}</p>
                  <p><strong>Capacity:</strong> {transporterProfile.vehicleCapacity} KL</p>
                  <p><strong>Status:</strong> <span className="text-amber-400 font-bold">Awaiting Admin Verification</span></p>
                </div>
              </>
            ) : transporterProfile.status === 'REJECTED' ? (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-red-500 mb-3">Registration Rejected</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Unfortunately, your application for transporter registration has been rejected. Please contact the administrative help desk for further clarifications.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-red-500 mb-3">Account Suspended</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Your transporter account has been suspended by the platform administrator. Please contact system support.
                </p>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Title and Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {transporterProfile?.ownerName || 'Operator'}
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            {transporterProfile?.companyName} • Area: {transporterProfile?.serviceArea} • Capacity: {transporterProfile?.vehicleCapacity} KL
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'requests' ? 'border-iocl-orange text-iocl-orange' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Available Loads ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'quotes' ? 'border-iocl-orange text-iocl-orange' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            My Quotes ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-2 font-bold text-sm tracking-wider uppercase transition-all border-b-2 ${activeTab === 'bookings' ? 'border-iocl-orange text-iocl-orange' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Active Bookings ({bookings.length})
          </button>
        </div>

        {loadingLists ? (
          <div className="py-12 flex justify-center items-center flex-col gap-2">
            <Loader2 className="w-8 h-8 text-iocl-orange animate-spin" />
            <p className="text-xs text-slate-400 font-bold">Syncing Bidding Boards...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'requests' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-semibold italic shadow-sm">
                    No active transport requests available in your area. Check back later!
                  </div>
                ) : (
                  requests.map((req: any) => (
                    <div key={req._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
                            Load Post
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(req.requiredDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-iocl-blue mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pickup Depot</p>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{req.pickupLocation}</p>
                            </div>
                          </div>

                          <div className="w-px h-4 bg-slate-200 my-1 ml-2"></div>

                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-iocl-orange mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Delivery Site</p>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{req.deliveryLocation}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider">Product Type</span>
                            <span className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-orange-500" /> {req.fuelType}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider">Volume</span>
                            <span className="text-xs font-extrabold text-slate-900 mt-0.5">
                              {req.quantityKl?.toLocaleString() || req.quantityKl} L
                            </span>
                          </div>
                        </div>

                        {req.specialInstructions && (
                          <div className="text-[11px] text-slate-500 bg-amber-50/50 border border-amber-100 rounded-xl p-2.5">
                            <span className="font-bold text-amber-800">Note:</span> {req.specialInstructions}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenBidModal(req)}
                        className="w-full mt-5 flex items-center justify-center gap-1.5 py-2.5 bg-iocl-blue hover:bg-iocl-blue/90 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                      >
                        Submit Quote <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-2">Load details</th>
                      <th className="py-3 px-2">Bid Amount</th>
                      <th className="py-3 px-2">Transit ETA</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 italic">No quotes submitted yet.</td>
                      </tr>
                    ) : (
                      quotes.map((q: any) => (
                        <tr key={q._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-2">
                            <p className="font-bold text-slate-900">
                              {q.requestRef?.pickupLocation} → {q.requestRef?.deliveryLocation}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Product: {q.requestRef?.fuelType} • Vol: {q.requestRef?.quantityKl} KL
                            </p>
                          </td>
                          <td className="py-4 px-2 font-bold text-slate-900">₹{Number(q.quotedAmount).toLocaleString()}</td>
                          <td className="py-4 px-2 text-slate-600">{q.estimatedHours} Hours</td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              q.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
                              q.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-slate-500 italic max-w-[200px] truncate" title={q.remarks}>
                            {q.remarks || 'No notes'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Active bookings assigned to your fleet</h3>
                  <button
                    onClick={fetchMarketplaceData}
                    disabled={loadingLists}
                    className="text-xs font-semibold text-iocl-blue hover:text-iocl-blue/80 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {loadingLists ? 'Refreshing…' : 'Refresh status'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookings.length === 0 ? (
                    <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-semibold italic shadow-sm">
                      No confirmed shipping bookings assigned to you.
                    </div>
                  ) : (
                    bookings.map((bk: any) => (
                    <div key={bk._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-green-100 text-green-800 border border-green-200 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Booking Confirmed
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          bk.status === 'DELIVERED' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-iocl-orange/10 text-iocl-orange border-iocl-orange/20'
                        }`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Route</p>
                          <p className="text-xs font-bold text-slate-900 mt-1">
                            {bk.requestRef?.pickupLocation} → {bk.requestRef?.deliveryLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cargo</p>
                          <p className="text-xs font-bold text-slate-900 mt-1">
                            {bk.requestRef?.fuelType} ({bk.requestRef?.quantityKl} KL)
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Contract Price</span>
                          <span className="text-sm font-extrabold text-slate-900">₹{Number(bk.bookingAmount).toLocaleString()}</span>
                        </div>

                        {/* Dispatch progression buttons */}
                        <div className="flex gap-2">
                          {bk.status === 'BOOKED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(bk._id, 'DISPATCHED')}
                              disabled={actionLoading === bk._id}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-[10px] shadow-sm transition-all ${actionLoading === bk._id ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-iocl-blue text-white hover:bg-iocl-blue/90'}`}
                            >
                              {actionLoading === bk._id ? 'Updating…' : 'Dispatch Vehicle'}
                            </button>
                          )}
                          {bk.status === 'DISPATCHED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(bk._id, 'IN_TRANSIT')}
                              disabled={actionLoading === bk._id}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-[10px] shadow-sm transition-all ${actionLoading === bk._id ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-iocl-orange text-white hover:brightness-110'}`}
                            >
                              {actionLoading === bk._id ? 'Updating…' : 'Start Transit'}
                            </button>
                          )}
                          {bk.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(bk._id, 'DELIVERED')}
                              disabled={actionLoading === bk._id}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-[10px] shadow-sm transition-all ${actionLoading === bk._id ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              {actionLoading === bk._id ? 'Updating…' : 'Mark Delivered'}
                            </button>
                          )}
                          {bk.status === 'DELIVERED' && (
                            <span className="text-slate-400 italic text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </main>

      {/* Bid Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={handleCloseBidModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Place Carrier Quote</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Posting from: {selectedRequest.pickupLocation} to {selectedRequest.deliveryLocation}
            </p>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quote Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-iocl-orange text-sm font-semibold"
                  placeholder="e.g. 14500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estimated delivery time (Hours) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidEta}
                  onChange={(e) => setBidEta(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-iocl-orange text-sm font-semibold"
                  placeholder="e.g. 6"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remarks</label>
                <input
                  type="text"
                  value={bidRemarks}
                  onChange={(e) => setBidRemarks(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-iocl-orange text-sm font-semibold"
                  placeholder="e.g. Vehicle available immediately"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCloseBidModal}
                  className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="w-2/3 py-2.5 bg-iocl-orange hover:bg-iocl-orange/90 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {submittingBid ? 'Submitting Bid...' : 'Submit Bid'}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
