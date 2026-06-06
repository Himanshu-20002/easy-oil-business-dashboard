import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from './Card';
import { Badge } from './Badge';
import {
  Plus,
  MapPin,
  Droplet,
  Calendar,
  Navigation,
  ChevronRight,
  ListFilter,
  CheckCircle2,
  Star,
  Truck,
  Phone,
  User,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface TransportMarketplaceProps {
  // Add props if needed
}


export function TransportMarketplace({ }: TransportMarketplaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get('orderId');

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'active_shipments' | 'create_request'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'eta'>('price');

  // Form Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [quantityKl, setQuantityKl] = useState(0);
  const [requiredDate, setRequiredDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [awaitingOrders, setAwaitingOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (activeSubTab === 'requests' || orderIdParam) {
      fetchRequests();
    }
  }, [activeSubTab, orderIdParam]);

  useEffect(() => {
    if (activeSubTab === 'active_shipments') {
      fetchBookings();
    }
  }, [activeSubTab]);

  useEffect(() => {
    const fetchAwaitingOrders = async () => {
      if (activeSubTab !== 'create_request') return;
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (res.ok && json.success) {
          const filtered = json.orders.filter((o: any) => o.transportStatus === 'AWAITING_TRANSPORT');
          setAwaitingOrders(filtered);
        }
      } catch (err) {
        console.error('Error fetching awaiting orders:', err);
      }
    };
    fetchAwaitingOrders();
  }, [activeSubTab]);

  useEffect(() => {
    const checkAndPreFillOrder = async () => {
      if (!orderIdParam) return;
      if (requests.length > 0) {
        const matchingReq = requests.find(r =>
          r.orderRef === orderIdParam ||
          (r.orderRef && (r.orderRef._id === orderIdParam || r.orderRef.orderId === orderIdParam)) ||
          r.orderRef?._id === orderIdParam || r.orderRef?.orderId === orderIdParam
        );
        if (matchingReq) {
          setSelectedRequest(matchingReq);
          setQuotes([]); // Clear stale quotes immediately
          fetchQuotesForRequest(matchingReq._id);
          setActiveSubTab('requests');
          return;
        }
      }

      // Avoid refetching if selectedOrder already matches orderIdParam
      if (selectedOrder && (selectedOrder._id === orderIdParam || selectedOrder.orderId === orderIdParam)) {
        return;
      }

      // If no matching request was found, fetch the order details to prefill the create request form
      try {
        const res = await fetch(`/api/orders/tracking?orderId=${orderIdParam}`);
        const json = await res.json();
        if (res.ok && json.success && json.order) {
          const orderData = json.order;
          setSelectedOrder(orderData);
          setFuelType(orderData.product);
          setQuantityKl(orderData.quantity);
          setActiveSubTab('create_request');
        }
      } catch (err) {
        console.error('Error fetching order for prefill:', err);
      }
    };

    checkAndPreFillOrder();
  }, [orderIdParam, requests, selectedOrder]);


  const fetchRequests = async () => {
    try {
      const url = orderIdParam ? `/api/marketplace/requests?orderId=${orderIdParam}` : '/api/marketplace/requests';
      const res = await fetch(url);
      const json = res ? await res.json() : null;
      if (json && json.success) {
        setRequests(json.requests);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/marketplace/bookings');
      const json = res ? await res.json() : null;
      if (json && json.success) {
        setBookings(json.bookings);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    }
  };

  const fetchQuotesForRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/quotes?requestId=${requestId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setQuotes(json.quotes);
      }
    } catch (err) {
      console.error('Fetch quotes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (bookingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/bookings?bookingId=${bookingId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedBooking(json.booking);
        setTimeline(json.timeline);
      }
    } catch (err) {
      console.error('Fetch booking timeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation: pickup,
          deliveryLocation: delivery,
          fuelType,
          quantityKl,
          requiredDate,
          specialInstructions: instructions,
          orderId: orderIdParam || selectedOrder?.orderId || selectedOrder?._id || undefined
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchRequests();
        setWizardStep(1);
        setActiveSubTab('requests');
        // Automatically select the new request to show competitive bids!
        handleSelectRequest(json.request);
      } else {
        alert(json.message || 'Failed to submit logistics request');
      }
    } catch (err) {
      console.error('Submit logistics request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (req: any) => {
    setSelectedRequest(req);
    setQuotes([]); // Clear stale quotes immediately
    fetchQuotesForRequest(req._id);
  };

  const handleBookQuote = async (quoteId: string) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest._id,
          quoteId
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchRequests();
        fetchBookings();
        setSelectedRequest(null);
        setQuotes([]);
        router.push('/customer/dashboard?tab=orders');
      } else {
        alert(json.message || 'Failed to book transport');
      }
    } catch (err) {
      console.error('Book transport error:', err);
    }
  };

  const handleSelectBooking = (booking: any) => {
    fetchBookingDetails(booking._id);
  };

  // Simulate progress logic for verification testing
  const handleSimulateProgress = async () => {
    if (!selectedBooking) return;
    const stages = ['BOOKED', 'VEHICLE_ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'COMPLETED'];
    const currentIndex = stages.indexOf(selectedBooking.status);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return;

    const nextStatus = stages[currentIndex + 1];
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          status: nextStatus,
          remarks: `Simulating status progression to ${nextStatus.replace('_', ' ')}`
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchBookings();
        fetchBookingDetails(selectedBooking._id);
      }
    } catch (err) {
      console.error('Simulate progression error:', err);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortBy === 'price') {
      return a.quotedAmount - b.quotedAmount;
    } else if (sortBy === 'rating') {
      return b.transporterRef.rating - a.transporterRef.rating;
    } else {
      return a.estimatedHours - b.estimatedHours;
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Transport Logistics Marketplace</h2>
            <p className="text-xs text-slate-500 mt-0.5">Procure verified tankers and manage fuel deliveries</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => {
              setActiveSubTab('requests');
              setSelectedRequest(null);
              if (orderIdParam) {
                router.push('/customer/dashboard?tab=transporters');
              }
            }}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer border-5 ${activeSubTab === 'requests'
              ? 'bg-white text-slate-900 border-gray-200 '
              : 'text-slate-500 hover:text-slate-900 border-transparent'
              }`}
          >
            My Requests
          </button>

          <button
            onClick={() => {
              setActiveSubTab('create_request');
              if (orderIdParam) {
                router.push('/customer/dashboard?tab=transporters');
              }
            }}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer border-5 ${activeSubTab === 'create_request'
              ? 'bg-orange-600 text-white border-gray-200'
              : 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
              }`}
          >
            <Plus className="w-4 h-4 font-bold" />
            Create Bidding Request
          </button>
        </div>
      </div>

      {activeSubTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-3">Open Bidding Requests</h3>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No open transport requests found.<br />
                  <button
                    onClick={() => setActiveSubTab('create_request')}
                    className="mt-3 text-blue-600 font-bold hover:underline"
                  >
                    Create Request
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      onClick={() => handleSelectRequest(req)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedRequest?._id === req._id
                        ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate flex-1">{req.pickupLocation.split(',')[0]} → {req.deliveryLocation.split(',')[0]}</span>
                        <Badge variant={req.status === 'BOOKED' ? 'success' : 'warning'} size="sm">
                          {req.status === 'BOOKED' ? 'Booked' : 'Bidding'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                        <span>{req.quantityKl?.toLocaleString() || req.quantityKl} L &bull; {req.fuelType}</span>
                        <span>{new Date(req.requiredDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quotes Section */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRequest ? (
              <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Quotes & Offers</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedRequest.pickupLocation} to {selectedRequest.deliveryLocation}</p>
                  </div>
                  {selectedRequest.status !== 'BOOKED' && (
                    <div className="flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-700 font-bold outline-none"
                      >
                        <option value="price">Sort by Price</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="eta">Sort by ETA</option>
                      </select>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading quote comparisons...</div>
                ) : sortedQuotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No quotes submitted yet by transporters.</div>
                ) : (
                  <div className="space-y-4">
                    {sortedQuotes.map((q) => {
                      const commFee = q.quotedAmount * 0.03;
                      const isBooked = selectedRequest.status === 'BOOKED' && selectedRequest.selectedQuoteRef === q._id;

                      return (
                        <div
                          key={q._id}
                          className={`p-4 border rounded-xl transition-all ${isBooked
                            ? 'border-green-500 bg-green-50/10 shadow-sm'
                            : selectedRequest.status === 'BOOKED'
                              ? 'border-slate-100 opacity-60'
                              : 'border-slate-200 hover:shadow-md'
                            }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Truck className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-slate-900 text-sm">{q.transporterRef.companyName}</h4>
                                  <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-blue-800" />
                                    {q.transporterRef.rating}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Vehicle: {q.fleetRef.vehicleNumber} &bull; Capacity: {q.fleetRef.capacityKl} KL &bull; Driver: {q.fleetRef.driverName}
                                </p>
                                <p className="text-xs text-slate-600 italic mt-2">"{q.remarks}"</p>
                              </div>
                            </div>

                            <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                              <div>
                                <p className="font-extrabold text-blue-600 text-base">{formatCurrency(q.quotedAmount)}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Est. ETA: {q.estimatedHours} hrs</p>
                              </div>
                              {selectedRequest.status !== 'BOOKED' ? (
                                <button
                                  onClick={() => handleBookQuote(q._id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center gap-1.5 border border-orange-600 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                                >
                                  Book Transporter
                                </button>
                              ) : isBooked ? (
                                <Badge variant="success" size="md">✓ Selected & Booked</Badge>
                              ) : (
                                <Badge variant="default" size="md">Declined</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl py-20 text-center text-slate-500 text-xs">
                Select an open bidding request on the left to compare competitive logistics quotes.
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'active_shipments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Bookings List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-3">Booked Deliveries</h3>
              {bookings.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">No active bookings found.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {bookings.map((bk) => (
                    <div
                      key={bk._id}
                      onClick={() => handleSelectBooking(bk)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedBooking?._id === bk._id
                        ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate flex-1">{bk.requestRef?.pickupLocation.split(',')[0]} → {bk.requestRef?.deliveryLocation.split(',')[0]}</span>
                        <Badge variant={bk.status === 'COMPLETED' ? 'success' : 'info'} size="sm">
                          {bk.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                        <span className="font-semibold text-slate-800">{bk.transporterRef?.companyName}</span>
                        <span>{formatCurrency(bk.bookingAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Tracking timeline */}
          <div className="lg:col-span-2 space-y-4">
            {selectedBooking ? (
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Delivery Tracker & Timeline</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Booking Reference ID: {selectedBooking._id}</p>
                  </div>
                  {/* Simulation controller */}
                  {selectedBooking.status !== 'COMPLETED' && (
                    <button
                      onClick={handleSimulateProgress}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                      title="Simulate dispatch timeline changes"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Simulate Progress
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Transporter</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">{selectedBooking.transporterRef?.companyName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Driver Contact</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      {selectedBooking.driverName}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedBooking.driverMobile}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Booking Cost</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">{formatCurrency(selectedBooking.bookingAmount)}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Includes commission platform fees</span>
                  </div>
                </div>

                {/* Vertical Stepper Timeline */}
                <h4 className="font-bold text-slate-800 text-xs mb-4">Milestone Progress</h4>
                {loading ? (
                  <p className="text-center py-6 text-slate-400 text-xs">Loading timeline...</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-4">
                    {timeline.map((step, i) => (
                      <div key={step._id || i} className="relative">
                        {/* Dot marker */}
                        <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs capitalize">{step.status.replace('_', ' ')}</span>
                            <span className="text-[9px] text-slate-400">{new Date(step.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{step.remarks}</p>
                          <span className="text-[8px] font-bold text-slate-400 block mt-0.5">Updated by {step.updatedBy}</span>
                        </div>
                      </div>
                    ))}
                    {selectedBooking.status !== 'COMPLETED' && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white" />
                        <span className="text-xs text-slate-400 italic">Remaining delivery milestones pending...</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl py-20 text-center text-slate-500 text-xs">
                Select an active shipment on the left to track its transit timeline and driver communications.
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'create_request' && (
        <Card className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-bold text-slate-900 text-base">Request Transport Logistics</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fill details step by step to solicit verified competitive bids from transport partners.</p>
          </div>

          {/* Stepper Status Indicator */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep === step
                  ? 'bg-blue-600 text-white'
                  : wizardStep > step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                  {step}
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {step === 1 ? 'Route' : step === 2 ? 'Cargo' : 'Submit'}
                </span>
                {step < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </div>
            ))}
          </div>

          {/* Wizard Step Content */}
          <div className="space-y-4 min-h-64">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Active Fuel Order</label>
                  {orderIdParam ? (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center justify-between">
                      <span>Order ID: <span className="text-blue-600 font-extrabold">{orderIdParam}</span></span>
                      <Badge variant="info" size="sm">Pre-selected</Badge>
                    </div>
                  ) : awaitingOrders.length === 0 ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                      <p className="text-orange-700 text-xs font-bold">You have no active fuel orders awaiting transport.</p>
                      <button 
                        onClick={() => router.push('/customer/dashboard?tab=buy-fuel')}
                        className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-md border border-orange-600 cursor-pointer transition-colors"
                      >
                        Buy Fuel First
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedOrder ? selectedOrder.orderId : ''}
                      onChange={(e) => {
                        const ord = awaitingOrders.find(o => o.orderId === e.target.value);
                        setSelectedOrder(ord || null);
                        if (ord) {
                          setFuelType(ord.product);
                          setQuantityKl(ord.quantity);
                        } else {
                          setFuelType('');
                          setQuantityKl(0);
                          setRequiredDate('');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">-- Choose Fuel Order --</option>
                      {awaitingOrders.map(o => (
                        <option key={o._id} value={o.orderId}>
                          Order {o.orderId} — {o.product} ({o.quantity.toLocaleString()} L)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Location Depot</label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Select Depot --</option>
                    <option value="IOCL Terminal, Noida">IOCL Depot Noida Terminal</option>
                    <option value="BPCL Depot Terminal, Sewri Mumbai">BPCL Depot Terminal, Sewri Mumbai</option>
                    <option value="HPCL Terminal Hub, Visakhapatnam">HPCL Terminal Hub, Visakhapatnam</option>
                    <option value="Custom Refinery Warehouse Depot A">Custom Refinery Warehouse Depot A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Site Address</label>
                  <input
                    type="text"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Enter delivery site address"
                  />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargo Product Type</label>
                    <select
                      value={fuelType}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 text-sm font-semibold outline-none cursor-not-allowed"
                    >
                      <option value="">-- Select Product Type --</option>
                      <option value="HSD">Diesel (HSD)</option>
                      <option value="LDO">Light Diesel Oil (LDO)</option>
                      <option value="Bitumen">Bitumen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity (L - Litres)</label>
                    <input
                      type="text"
                      value={quantityKl ? `${quantityKl.toLocaleString()} L` : ''}
                      readOnly
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 text-sm font-semibold outline-none cursor-not-allowed"
                      placeholder="e.g. 10,000 L"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Delivery Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-2">Logistics Summary Confirmation</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between"><span className="font-semibold">Pickup Depot:</span><span>{pickup}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Delivery Destination:</span><span>{delivery}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Product Type & Qty:</span><span>{quantityKl?.toLocaleString() || quantityKl} L ({fuelType})</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Required Date:</span><span>{requiredDate ? new Date(requiredDate).toLocaleDateString('en-IN') : ''}</span></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2">Special Instructions / Cargo Notes</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 text-xs outline-none focus:border-blue-500 transition-all h-20"
                    placeholder="Enter special gate constraints or timing instructions..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer buttons */}
          <div className="flex justify-between border-t border-slate-100 pt-6 mt-6">
            {wizardStep > 1 ? (
              <button
                onClick={() => setWizardStep(prev => prev - 1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-lg text-xs transition-colors"
              >
                Back Step
              </button>
            ) : (
              <div />
            )}

            {wizardStep < 3 ? (
              <button
                onClick={() => {
                  if (wizardStep === 1) {
                    if (!orderIdParam && !selectedOrder) {
                      alert('Please select an active fuel order.');
                      return;
                    }
                    if (!pickup) {
                      alert('Please select a pickup depot.');
                      return;
                    }
                    if (!delivery.trim()) {
                      alert('Please enter a delivery site address.');
                      return;
                    }
                  } else if (wizardStep === 2) {
                    if (!fuelType) {
                      alert('Please select a cargo product type.');
                      return;
                    }
                    if (!quantityKl || quantityKl <= 0) {
                      alert('Please enter a valid cargo quantity greater than 0 KL.');
                      return;
                    }
                    if (!requiredDate) {
                      alert('Please select a required delivery date.');
                      return;
                    }
                  }
                  setWizardStep(prev => prev + 1);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-6 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer border border-orange-600 shadow-sm"
              >
                Next Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={handleCreateRequest}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-350 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg uppercase tracking-wider cursor-pointer border border-green-700"
              >
                {loading ? 'Submitting...' : 'Submit Bidding Request'}
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
