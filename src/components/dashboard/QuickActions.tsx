import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from './Card';
import { Badge } from './Badge';
import { Fuel, Truck, Star, MapPin, DollarSign, ArrowRight, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';

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
  const [quantity, setQuantity] = useState<number | ''>(5000);
  const [orderStep, setOrderStep] = useState<'input' | 'quote' | 'success'>('input');
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  const fuelProducts = [
    { name: 'Diesel (HSD)', rate: 85, desc: 'High Speed Diesel for generators & vehicles' },
    { name: 'Light Diesel Oil (LDO)', rate: 78, desc: 'Industrial furnace and boiler fuel' },
    { name: 'Bitumen', rate: 92, desc: 'Road construction grade binder' }
  ];

  const activeProduct = fuelProducts.find(p => p.name === selectedProduct) || fuelProducts[0];
  const estCost = (Number(quantity) || 0) * activeProduct.rate;
  const hasSufficientCredit = estCost <= availableCredit;

  const handlePlaceFuelOrder = async () => {
    if (!hasSufficientCredit || !quantity || Number(quantity) <= 0) return;
    const newId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      orderId: newId,
      product: selectedProduct.includes('HSD') ? 'HSD' : selectedProduct.includes('LDO') ? 'LDO' : 'Bitumen',
      quantity: Number(quantity),
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



  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Buy Fuel Card */}
        {(!defaultSection || defaultSection === 'fuel') && (
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.08)] hover:border-blue-200 hover:scale-[1.005] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100/80 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Fuel className="w-6 h-6 text-blue-500 animate-pulse" />
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
                            className={`p-3.5 border rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between hover:scale-[1.01] ${selectedProduct === p.name
                              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-blue-300 bg-white/40'
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
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(0, (Number(prev) || 0) - 1000))}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 active:scale-95 transition-all text-sm shrink-0"
                        >
                          - 1,000 L
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={quantity}
                            placeholder="Enter quantity"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setQuantity('');
                              } else {
                                const parsed = parseInt(val);
                                if (!isNaN(parsed)) {
                                  setQuantity(Math.max(0, parsed));
                                }
                              }
                            }}
                            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 font-extrabold outline-none focus:border-blue-500 focus:bg-white transition-all text-lg pr-12 text-center"
                          />
                          <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">LITRES</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => (Number(prev) || 0) + 1000)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 active:scale-95 transition-all text-sm shrink-0"
                        >
                          + 1,000 L
                        </button>
                      </div>

                      {/* Predefined Presets */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[1000, 5000, 10000, 20000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setQuantity(preset)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${Number(quantity) === preset
                              ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                          >
                            {preset.toLocaleString()} L
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Estimate */}
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Rate per Litre</span>
                        <span>{formatCurrency(activeProduct.rate)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-800 font-semibold border-b border-slate-200/60 pb-2">
                        <span>Quantity</span>
                        <span>{(Number(quantity) || 0).toLocaleString()} L</span>
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
                  </div>
                )}

                {orderStep === 'quote' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50/50 border border-yellow-200 p-4 rounded-xl space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm">Order Summary & Quotation</h4>
                      <p className="text-xs text-slate-600">Please confirm your procurement order details below. The funds will be put on hold from your available credit.</p>
                      <div className="space-y-1.5 text-xs text-slate-700 pt-2">
                        <div className="flex justify-between"><span className="font-medium">Product</span><span className="font-bold">{selectedProduct}</span></div>
                        <div className="flex justify-between"><span className="font-medium">Quantity</span><span className="font-bold">{(Number(quantity) || 0).toLocaleString()} L</span></div>
                        <div className="flex justify-between"><span className="font-medium">Delivery Location</span><span className="font-bold">Mumbai Hub (Site A)</span></div>
                        <div className="flex justify-between"><span className="font-medium">Est. Delivery Date</span><span className="font-bold">Within 3 Days</span></div>
                      </div>
                      <div className="border-t border-yellow-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Total Quote Amount</span>
                        <span className="font-extrabold text-slate-900 text-base">{formatCurrency(estCost)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {orderStep === 'input' && (
                <div className="pt-4">
                  <button
                    disabled={!quantity || Number(quantity) <= 0 || !hasSufficientCredit}
                    onClick={() => setOrderStep('quote')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    Generate Instant Quote
                    <ArrowRight className="w-4.5 h-4.5 animate-pulse" />
                  </button>
                </div>
              )}

              {orderStep === 'quote' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setOrderStep('input')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceFuelOrder}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              )}

              {orderStep === 'success' && (
                <div className="text-center py-8 space-y-5 flex-1 flex flex-col justify-center items-center my-auto animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Order Placed Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">Your order has been recorded with ID <span className="font-bold text-blue-600">{lastPlacedOrderId}</span></p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    You can track the dispatch status real-time in the "My Orders" panel.
                  </div>
                  <button
                    onClick={() => {
                      setOrderStep('input');
                      setQuantity(5000);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Place Another Order
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Logistics and Fuel Info/News */}
        {(!defaultSection || defaultSection === 'transporters') && (
          <div className="flex flex-col gap-6 justify-between h-full">
            {/* Logistics Marketplace Card (Sleek & Compact Glass) */}
            <div className="relative overflow-hidden bg-slate-950/90 text-white rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between flex-1 min-h-[200px] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(30,41,59,0.3)] hover:border-slate-700 hover:scale-[1.005] animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75">
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[60px] pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">Logistics Marketplace</h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                    Need a tanker to transport your fuel dispatches? Book certified carriers bidding on your routes.
                  </p>
                </div>

                <div className="flex gap-2 text-right shrink-0">
                  <div className="bg-slate-900/80 border border-blue-500 px-2.5 py-1.5 rounded-lg">
                    <span className="text-[8px] text-green-500 font-bold block uppercase tracking-wider">Carriers</span>
                    <span className="text-xs font-extrabold text-white block">3 Active</span>
                  </div>
                  <div className="bg-slate-900/80 border border-blue-500 px-2.5 py-1.5 rounded-lg">
                    <span className="text-[8px] text-green-500 font-bold block uppercase tracking-wider">Avg. Bid</span>
                    <span className="text-xs font-extrabold text-blue-400 block">&lt; 15m</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 relative z-10">
                <Link
                  href="/customer/dashboard?tab=transporters"
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-500/20"
                >
                  Book via Transporter Marketplace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Current Selected Fuel Info & News Card */}
            <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between flex-1 min-h-[290px] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] hover:border-blue-200 hover:scale-[1.005] animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Badge variant="info" size="sm">Active Product Spec</Badge>
                    <span className="text-xs text-slate-500 font-semibold">{selectedProduct}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Stable Trend
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Density</span>
                    <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">
                      {selectedProduct.includes('HSD') ? '820-845 kg/m³' : selectedProduct.includes('LDO') ? '850-900 kg/m³' : '1010-1060 kg/m³'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Flash Point</span>
                    <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">
                      {selectedProduct.includes('HSD') ? '> 35°C' : selectedProduct.includes('LDO') ? '> 66°C' : '> 220°C'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Sulfur Content</span>
                    <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">
                      {selectedProduct.includes('HSD') ? '< 10 ppm (BS-VI)' : selectedProduct.includes('LDO') ? '< 0.5%' : '< 4.0%'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Grade Standard</span>
                    <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">
                      {selectedProduct.includes('HSD') ? 'IS 1460 (BS-VI)' : selectedProduct.includes('LDO') ? 'IS 15770 LDO' : 'VG-30 / VG-40'}
                    </span>
                  </div>
                </div>
              </div>

              {/* News Bottom Rectangle (Dark Glass style) */}
              <div className="mt-4 bg-slate-900 text-white rounded-xl border border-slate-800 p-3.5 space-y-1.5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">Refinery News Update</span>
                  <span className="text-[9px] text-slate-400">Just now</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">
                  {selectedProduct.includes('HSD')
                    ? 'BS-VI HSD Production Steady at Jamnagar'
                    : selectedProduct.includes('LDO')
                      ? 'Industrial Boiler Consumption Patterns Increase'
                      : 'Highway Infrastructure Expansion Drives VG-30 Bitumen'}
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {selectedProduct.includes('HSD')
                    ? 'Refinery outputs suggest high inventory reliability for high speed diesel this quarter, stabilizing retail pricing benchmarks.'
                    : selectedProduct.includes('LDO')
                      ? 'A 4% rise in month-over-month furnace grade fuels has been driven by increased manufacturing plant run-rates.'
                      : 'Domestic vg-grade bitumen dispatches have scaled as central road development ministries expedite highway paving tasks.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
