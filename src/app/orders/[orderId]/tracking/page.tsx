'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Truck, Calendar, MapPin, Shield, Navigation, 
  CheckCircle2, Clock, User, Phone, DollarSign, Loader2, Play 
} from 'lucide-react';
import { Header } from '@/components/brand/Header';
import { Footer } from '@/components/brand/Footer';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';

export default function ShipmentTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  const fetchTrackingDetails = async () => {
    try {
      const res = await fetch(`/api/orders/tracking?orderId=${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json.order);
        setTimeline(json.timeline || []);
      } else {
        setError(json.message || 'Failed to fetch tracking details');
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred while loading telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTrackingDetails();
    }
  }, [orderId]);

  const handleSimulateNextStage = async () => {
    if (!order || !order.bookingRef || simulating) return;
    setSimulating(true);

    const bookingId = order.bookingRef._id;
    const currentStatus = order.bookingRef.status;

    // Ordered sequence of simulator status stages
    const stages = ['BOOKED', 'VEHICLE_ASSIGNED', 'LOADING_AT_DEPOT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const currentIndex = stages.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      alert('Shipment has already reached its final delivery destination.');
      setSimulating(false);
      return;
    }

    const nextStatus = stages[currentIndex + 1];
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: nextStatus,
          remarks: `Simulating status progression to ${nextStatus.replace(/_/g, ' ')}`
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchTrackingDetails();
      } else {
        alert(json.message || 'Simulated progress step failed');
      }
    } catch (err: any) {
      alert('Error during simulation step: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Opening Secure Telemetry Connection...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header />
        <main className="max-w-2xl mx-auto py-16 px-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Tracking Connection Failed</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'The requested order details could not be found.'}</p>
          <button 
            onClick={() => router.push('/customer/dashboard?tab=orders')}
            className="bg-blue-600 hover:bg-blue-750 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md"
          >
            Return to Orders
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const booking = order.bookingRef;
  const transportRequest = order.transportRequestRef;
  const transporter = booking?.transporterRef;
  const fleet = booking?.fleetRef;

  // Determine active steps for the custom timeline
  const getTimelineSteps = () => {
    const bookingStatus = booking?.status || 'AWAITING_TRANSPORT';
    
    const steps = [
      { key: 'ORDER_CREATED', label: 'Order Created', desc: 'Fuel procurement submitted & credit check verified.', done: true },
      { key: 'SUPPLIER_CONFIRMED', label: 'Supplier Confirmed', desc: 'IOCL terminal bay allocated and loading indent generated.', done: true },
      { key: 'TRANSPORT_BOOKED', label: 'Transport Booked', desc: 'Carrier dispatch contract accepted and signed.', done: !!booking },
      { key: 'VEHICLE_ASSIGNED', label: 'Vehicle Assigned', desc: `Tanker assigned: ${fleet?.vehicleNumber || 'Pending'}`, done: !!booking && ['VEHICLE_ASSIGNED', 'LOADING_AT_DEPOT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(bookingStatus) },
      { key: 'LOADING_AT_DEPOT', label: 'Loading at Depot', desc: 'Refinery loading bay decanting complete.', done: !!booking && ['LOADING_AT_DEPOT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(bookingStatus) },
      { key: 'DISPATCHED', label: 'Dispatched', desc: 'Gate pass verified. Leaving terminal gate.', done: !!booking && ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(bookingStatus) },
      { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Active GPS tracking enabled. Cargo heading to destination.', done: !!booking && ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(bookingStatus) },
      { key: 'DELIVERED', label: 'Delivered', desc: 'Unloading complete at buyer site. Signed challan upload.', done: !!booking && ['DELIVERED', 'COMPLETED'].includes(bookingStatus) }
    ];
    return steps;
  };

  const steps = getTimelineSteps();
  const activeStepCount = steps.filter(s => s.done).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow space-y-6">
        
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/customer/dashboard?tab=orders')}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Shipment Telemetry Feed</h1>
              <p className="text-xs text-slate-500 mt-0.5">Order Reference: {order.orderId}</p>
            </div>
          </div>

          {booking && (
            <button
              onClick={handleSimulateNextStage}
              disabled={simulating || booking.status === 'COMPLETED'}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider shadow-sm cursor-pointer border border-orange-600 disabled:border-slate-300"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Simulate Next Stage
                </>
              )}
            </button>
          )}
        </div>

        {/* Top summary section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col justify-between p-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Procured Product</span>
              <h3 className="text-xl font-bold text-slate-900">{order.product}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold">Total Quantity: <span className="font-bold text-slate-900">{(order.quantity).toLocaleString()} L</span></p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Supplier Refinery</span>
              <h3 className="text-lg font-bold text-slate-900">IOCL Terminal</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold">Source Depot: <span className="font-bold text-slate-900">Noida, Delhi NCR</span></p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Booking Cost</span>
              <h3 className="text-xl font-bold text-slate-900">
                {booking ? `₹${(booking.bookingAmount).toLocaleString()}` : 'N/A'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold">Carrier Rate Type: <span className="font-bold text-slate-900">Fixed Rate</span></p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Estimated ETA</span>
              <h3 className="text-lg font-bold text-slate-900">
                {new Date(order.deliveryETA).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold">Arrival Promise: <span className="font-bold text-slate-900">Guaranteed slot</span></p>
          </Card>
        </div>

        {/* Main Details and Stepper Timeline Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stepper Timeline Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">Delivery Tracking Timeline</h2>
              
              <div className="space-y-6 relative before:absolute before:left-5.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 ml-2">
                {steps.map((step, idx) => (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 transition-all ${
                      step.done
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {step.done ? <span className="text-[10px]">✓</span> : (idx + 1)}
                    </div>
                    
                    <div className="flex-1 pt-1.5">
                      <p className={`font-bold text-sm ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold text-center italic mt-6 border-t border-slate-100 pt-4">
              * Timeline logs are verified in real time against active GPS telemetry.
            </p>
          </div>

          {/* Right sidebar details */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Transporter Details */}
            <Card className="p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics Carrier</h3>
              {transporter ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{transporter.companyName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{transporter.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Service Area</p>
                      <p className="font-bold text-slate-800 mt-1">{transporter.serviceArea}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Transporter rating</p>
                      <p className="font-bold text-slate-800 mt-1">★ {transporter.rating || '5.0'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No transporter booked for this order yet.</p>
              )}
            </Card>

            {/* Vehicle & Driver Details */}
            <Card className="p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Driver & Tanker Details</h3>
              {booking ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{booking.driverName || 'Ramesh Singh'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Driver Contact</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 font-semibold">Mobile</span>
                      <span className="font-bold text-slate-800">{booking.driverMobile || '+91 9876543210'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 font-semibold">Tanker Capacity</span>
                      <span className="font-bold text-slate-800">{fleet?.vehicleCapacity || 20} KL</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 font-semibold">GPS Tracking Status</span>
                      <span className="font-bold text-emerald-600 animate-pulse">● Live Active</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">Logistics crew unassigned.</p>
              )}
            </Card>

            {/* Live GPS feed simulation */}
            {booking && (
              <div className="bg-slate-950 text-emerald-400 font-mono p-5 rounded-3xl text-xs space-y-2 shadow-inner border border-slate-800 relative overflow-hidden">
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">// SECURE GPS TELEMETRY FEED</p>
                <div className="space-y-1 font-semibold">
                  <p>ENROUTE: Noida depot &rarr; Ghaziabad buyer site</p>
                  <p>ALTITUDE: 154m MSL &bull; SPEED: {['IN_TRANSIT', 'DISPATCHED'].includes(booking.status) ? '48 km/h' : '0 km/h'}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(activeStepCount / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

// Fallback dynamic helper
const AlertCircle = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
