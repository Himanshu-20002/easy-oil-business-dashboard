import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Fuel, Truck, Star, MapPin, DollarSign, ArrowRight, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface QuickActionsProps {
  onPlaceOrder?: (order: any) => Promise<boolean> | any;
  availableCredit?: number;
  defaultSection?: 'fuel' | 'transporters';
}

export function QuickActions({
  onPlaceOrder,
  availableCredit = 375000,
  defaultSection
}: QuickActionsProps) {
  // Fuel state
  const [selectedProduct, setSelectedProduct] = useState<string>('Diesel (HSD)');
  const [quantity, setQuantity] = useState<number>(5000);
  const [orderStep, setOrderStep] = useState<'input' | 'quote' | 'success'>('input');
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  // Transport state
  const [selectedTransporter, setSelectedTransporter] = useState<string | null>(null);
  const [destination, setDestination] = useState<string>('Primary Site (Mumbai Terminal)');
  const [transportStep, setTransportStep] = useState<'list' | 'confirm' | 'success'>('list');

  const fuelProducts = [
    { name: 'Diesel (HSD)', rate: 85, desc: 'High Speed Diesel for generators & vehicles' },
    { name: 'Light Diesel Oil (LDO)', rate: 78, desc: 'Industrial furnace and boiler fuel' },
    { name: 'Bitumen', rate: 92, desc: 'Road construction grade binder' }
  ];

  const transporters = [
    { name: 'FuelExpress Logistics', rating: 4.8, fleet: 150, ratePerKm: 12 },
    { name: 'TransportHub Pro', rating: 4.6, fleet: 200, ratePerKm: 14 },
    { name: 'Regional Haulers', rating: 4.5, fleet: 85, ratePerKm: 11 }
  ];

  const activeProduct = fuelProducts.find(p => p.name === selectedProduct) || fuelProducts[0];
  const estCost = quantity * activeProduct.rate;
  const hasSufficientCredit = estCost <= availableCredit;

  const handlePlaceFuelOrder = async () => {
    if (!hasSufficientCredit || quantity <= 0) return;
    const newId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      orderId: newId,
      product: selectedProduct.includes('HSD') ? 'HSD' : selectedProduct.includes('LDO') ? 'LDO' : 'Bitumen',
      quantity: quantity,
      status: 'processing',
      deliveryETA: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (onPlaceOrder) {
      const success = await onPlaceOrder(newOrder);
      if (success) {
        setLastPlacedOrderId(newId);
        setOrderStep('success');
      }
    }
  };

  const handleBookTransport = () => {
    setTransportStep('success');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Buy Fuel Card */}
        {(!defaultSection || defaultSection === 'fuel') && (
          <Card variant="elevated">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Fuel className="w-6 h-6 text-blue-500" />
                  Procure Fuel
                </h3>
                {orderStep !== 'success' && (
                  <span className="text-xs font-semibold text-slate-500">
                    Avail. Credit: <span className="text-green-600 font-bold">{formatCurrency(availableCredit)}</span>
                  </span>
                )}
              </div>

              {orderStep === 'input' && (
                <div className="space-y-4">
                  {/* Select Product */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Fuel Product</label>
                    <div className="space-y-2">
                      {fuelProducts.map((p) => (
                        <div
                          key={p.name}
                          onClick={() => setSelectedProduct(p.name)}
                          className={`p-3.5 border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            selectedProduct === p.name
                              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{formatCurrency(p.rate)}/L</p>
                            <p className="text-[10px] text-slate-400">Est. price</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Quantity (Litres)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-lg pr-12"
                      />
                      <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">LITRES</span>
                    </div>
                  </div>

                  {/* Price Estimate */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Rate per Litre</span>
                      <span>{formatCurrency(activeProduct.rate)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-800 font-semibold border-b border-slate-200/60 pb-2">
                      <span>Quantity</span>
                      <span>{quantity.toLocaleString()} L</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-slate-800 text-sm">Estimated Total Cost</span>
                      <span className="font-extrabold text-blue-600 text-lg">{formatCurrency(estCost)}</span>
                    </div>

                    {!hasSufficientCredit && (
                      <div className="mt-3 text-xs font-bold text-red-500 bg-red-50 p-2 rounded border border-red-100">
                        ⚠️ Order exceeds available credit limit of {formatCurrency(availableCredit)}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={quantity <= 0 || !hasSufficientCredit}
                    onClick={() => setOrderStep('quote')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Generate Instant Quote
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              {orderStep === 'quote' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50/50 border border-yellow-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Order Summary & Quotation</h4>
                    <p className="text-xs text-slate-600">Please confirm your procurement order details below. The funds will be put on hold from your available credit.</p>
                    <div className="space-y-1.5 text-xs text-slate-700 pt-2">
                      <div className="flex justify-between"><span className="font-medium">Product</span><span className="font-bold">{selectedProduct}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Quantity</span><span className="font-bold">{quantity.toLocaleString()} L</span></div>
                      <div className="flex justify-between"><span className="font-medium">Delivery Location</span><span className="font-bold">Mumbai Hub (Site A)</span></div>
                      <div className="flex justify-between"><span className="font-medium">Est. Delivery Date</span><span className="font-bold">Within 3 Days</span></div>
                    </div>
                    <div className="border-t border-yellow-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">Total Quote Amount</span>
                      <span className="font-extrabold text-slate-900 text-base">{formatCurrency(estCost)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setOrderStep('input')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceFuelOrder}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Confirm & Place Order
                    </button>
                  </div>
                </div>
              )}

              {orderStep === 'success' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Order Placed Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">Your order has been recorded with ID <span className="font-bold text-blue-600">{lastPlacedOrderId}</span></p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 max-w-sm mx-auto">
                    You can track the dispatch status real-time in the "My Orders" panel.
                  </div>
                  <button
                    onClick={() => {
                      setOrderStep('input');
                      setQuantity(5000);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
                  >
                    Place Another Order
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Find Transporters Card */}
        {(!defaultSection || defaultSection === 'transporters') && (
          <Card variant="elevated">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-500" />
                  Book Logistics
                </h3>
              </div>

              {transportStep === 'list' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">Select an approved logistics partner to handle your active fuel dispatches.</p>
                  <div className="space-y-3">
                    {transporters.map((t) => (
                      <div
                        key={t.name}
                        onClick={() => setSelectedTransporter(t.name)}
                        className={`p-3.5 border rounded-xl transition-all cursor-pointer ${
                          selectedTransporter === t.name
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {t.rating}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                {t.fleet} fleet size
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 text-sm">₹{t.ratePerKm}/km</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Base transport rate</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={!selectedTransporter}
                    onClick={() => setTransportStep('confirm')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Select Transporter
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              {transportStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 text-sm">Logistics Booking Detail</h4>
                      <button onClick={() => setTransportStep('list')} className="text-xs text-slate-500 hover:text-slate-800">Change</button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination Address</label>
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 pt-1">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Transporter</p>
                          <p className="font-bold text-slate-800 mt-0.5">{selectedTransporter}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Est. Base Price</p>
                          <p className="font-bold text-slate-800 mt-0.5">₹12,400 (Flat Rate)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setTransportStep('list')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBookTransport}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Book Dispatch Shipment
                    </button>
                  </div>
                </div>
              )}

              {transportStep === 'success' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Shipment Booked!</h4>
                    <p className="text-xs text-slate-500 mt-1">Transporter <span className="font-semibold text-slate-900">{selectedTransporter}</span> has been dispatched to collect the cargo.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 max-w-sm mx-auto">
                    A driver will contact you at your designated site shortly.
                  </div>
                  <button
                    onClick={() => {
                      setTransportStep('list');
                      setSelectedTransporter(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
                  >
                    Book Another Shipment
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
