import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { mockDashboardData } from '@/lib/dashboard-mock-data';
import { Download, Truck, Search, X, Check, ArrowRight, Loader2 } from 'lucide-react';

interface ActiveOrdersProps {
  orders?: any[];
  setOrders?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ActiveOrders({ orders: propOrders, setOrders }: ActiveOrdersProps) {
  const displayOrders = propOrders 
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'in_transit' | 'delivered'>('all');
  
  // Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  
  // Invoice state
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: string): 'info' | 'warning' | 'success' | 'default' => {
    switch (status) {
      case 'processing':
        return 'info';
      case 'in_transit':
        return 'warning';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    setDownloadingInvoiceId(orderId);
    setTimeout(() => {
      setDownloadingInvoiceId(null);
      setToastMessage(`Invoice for order ${orderId} downloaded successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  // Filter logic
  const filteredOrders = displayOrders.filter(order => {
    const orderIdStr = order.orderId || order.id || '';
    const productStr = order.product || '';
    
    const matchesSearch = 
      orderIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      order.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: 'placed', label: 'Order Placed', desc: 'Order accepted & credit verified', done: true },
      { key: 'processing', label: 'Fuel Loading', desc: 'Loading at refinery terminal', done: status !== 'placed' },
      { key: 'in_transit', label: 'In Transit', desc: 'GPS tracking dispatch active', done: status === 'in_transit' || status === 'delivered' },
      { key: 'delivered', label: 'Delivered', desc: 'Unloading complete & signed off', done: status === 'delivered' }
    ];
    return steps;
  };

  return (
    <div id="orders" className="mb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 text-xs border border-slate-700 animate-slide-in">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-[10px]">✓</div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Procured Fuel Orders</h2>
          <p className="text-xs text-slate-500 mt-1">Review active deliveries, dispatch schedules, and fetch historical invoice receipts.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        {/* Status Filters */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          {(['all', 'processing', 'in_transit', 'delivered'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Delivery ETA</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No orders found matching the filter.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id || order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{order.orderId || order.id}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{order.product}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold">{order.quantity.toLocaleString()} L</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {new Date(order.deliveryETA).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setTrackingOrder(order)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs border border-blue-100"
                            title="Track Order"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Track
                          </button>
                          <button
                            disabled={downloadingInvoiceId === (order._id || order.id)}
                            onClick={() => handleDownloadInvoice(order._id || order.id)}
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex items-center justify-center min-w-8"
                            title="Download Invoice"
                          >
                            {downloadingInvoiceId === (order._id || order.id) ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id || order.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-blue-600">{order.orderId || order.id}</p>
                  <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold">Product</p>
                    <p className="text-slate-900 font-semibold mt-1">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold">Quantity</p>
                    <p className="text-slate-900 font-semibold mt-1">{order.quantity.toLocaleString()} L</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs font-semibold">Delivery ETA</p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {new Date(order.deliveryETA).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => setTrackingOrder(order)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    Track
                  </button>
                  <button 
                    disabled={downloadingInvoiceId === (order._id || order.id)}
                    onClick={() => handleDownloadInvoice(order._id || order.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {downloadingInvoiceId === (order._id || order.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dispatch Tracking Modal Overlay */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Real-time GPS Tracking</p>
                <h3 className="font-bold text-lg mt-0.5">Shipment for {trackingOrder.id}</h3>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Content */}
            <div className="p-6 space-y-6">
              
              {/* Product Info Banner */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between text-xs text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Product Spec</span>
                  <span className="font-bold text-slate-900">{trackingOrder.product}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Cargo Quantity</span>
                  <span className="font-bold text-slate-900">{trackingOrder.quantity.toLocaleString()} Litres</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ETA Promise</span>
                  <span className="font-bold text-slate-900">{new Date(trackingOrder.deliveryETA).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})}</span>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-6 relative before:absolute before:left-5.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {getTrackingSteps(trackingOrder.status).map((step, idx) => (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Step circle indicator */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 transition-all ${
                      step.done
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {step.done ? <Check className="w-4 h-4 stroke-[3]" /> : (idx + 1)}
                    </div>
                    
                    <div className="flex-1 pt-1.5">
                      <p className={`font-bold text-sm ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulated Map / GPS Terminal */}
              <div className="bg-slate-950 text-emerald-400 font-mono p-4 rounded-xl text-xs space-y-1 shadow-inner border border-slate-800">
                <p className="text-[10px] text-slate-500">// TELEMETRY FEED (SIMULATED GPS)</p>
                <div className="flex justify-between mt-1 text-[11px]">
                  <span>LAT: 18.9750&bull; N</span>
                  <span>LNG: 72.8258&bull; E</span>
                  <span>HEADING: N-NE</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{
                    width: trackingOrder.status === 'processing' ? '33%' : trackingOrder.status === 'in_transit' ? '66%' : '100%'
                  }} />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setTrackingOrder(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
