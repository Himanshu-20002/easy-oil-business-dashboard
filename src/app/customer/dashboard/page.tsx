'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { SummaryCards } from '../../../components/dashboard/SummaryCards';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { ActiveOrders } from '../../../components/dashboard/ActiveOrders';
import { ConsumptionAnalytics } from '../../../components/dashboard/ConsumptionAnalytics';
import { SmartAlerts } from '../../../components/dashboard/SmartAlerts';
import { DocumentCenter } from '../../../components/dashboard/DocumentCenter';
import { BusinessServices } from '../../../components/dashboard/BusinessServices';
import { BusinessInsights } from '../../../components/dashboard/BusinessInsights';
import { mockDashboardData } from '../../../lib/dashboard-mock-data';
import { TransportMarketplace } from '../../../components/dashboard/TransportMarketplace';
import { FAQ } from '../../../components/dashboard/FAQ';
import { Card } from '../../../components/dashboard/Card';
import { Badge } from '../../../components/dashboard/Badge';
import { Loader2, ArrowRight, ShoppingBag, ShieldAlert, Award, ChevronRight, Lock } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Centralized dashboard states
  const [orders, setOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [creditLimit, setCreditLimit] = useState(500000);
  const [availableCredit, setAvailableCredit] = useState(375000);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch current application/company
        const res = await fetch('/api/applications/current');
        const json = await res.json();

        if (res.ok && json.success) {
          setData(json);
          if (json.company) {
            setCreditLimit(json.company.creditLimit ?? 500000);
            setAvailableCredit(json.company.availableCredit ?? 375000);
          }
          if (json.documents) {
            setDocuments(json.documents);
          }
        }

        // 2. Fetch orders from database
        const ordersRes = await fetch('/api/orders');
        const ordersJson = await ordersRes.json();
        if (ordersRes.ok && ordersJson.success) {
          setOrders(ordersJson.orders);
        }

        // 3. Fetch alerts from database
        const alertsRes = await fetch('/api/alerts');
        const alertsJson = await alertsRes.json();
        if (alertsRes.ok && alertsJson.success) {
          setAlerts(alertsJson.alerts);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('[v0] Error loading dashboard:', err.message || 'Unknown error');
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  const companyName = data?.company?.companyName || 'Fuel Solutions Inc';
  const applicationStatus = data?.application?.status || 'draft';
  const isApproved = applicationStatus === 'approved';

  const handlePlaceOrder = async (newOrder: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setOrders(prev => [json.order, ...prev]);
        setAvailableCredit(json.availableCredit);
        return true;
      } else {
        alert(json.message || 'Failed to place order');
        return false;
      }
    } catch (err) {
      console.error('Error placing order:', err);
      return false;
    }
  };

  const handleDismissAlert = async (id: any) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: id })
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(alert => alert._id !== id && alert.id !== id));
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const handleUploadDocument = (newDoc: any) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const renderOnboardingBanner = () => {
    if (isApproved) return null;

    let bannerBg = 'bg-blue-50 border-blue-200';
    let iconColor = 'text-blue-600';
    let title = 'Complete Your Profile Registration';
    let description = 'Provide your business registration details, GSTIN, and KYC documents to unlock active procurement features.';
    let actionLabel = 'Complete Application Form';
    let actionHref = '/customer/apply';
    let showAction = true;

    if (applicationStatus === 'submitted' || applicationStatus === 'under_review') {
      bannerBg = 'bg-amber-50 border-amber-200';
      iconColor = 'text-amber-600';
      title = 'Application Under Refinery Review';
      description = 'Your registration documents are being verified by our refinery officer. This process typically takes 24-48 business hours.';
      showAction = false;
    } else if (applicationStatus === 'correction_required') {
      bannerBg = 'bg-red-50 border-red-200';
      iconColor = 'text-red-600';
      title = 'Correction Required - Action Required';
      description = 'The refinery officer requested updates to your submitted registration form. Please check remarks and update files.';
      actionLabel = 'Update Details';
      actionHref = '/customer/apply';
    } else if (applicationStatus === 'rejected') {
      bannerBg = 'bg-slate-100 border-slate-300';
      iconColor = 'text-slate-600';
      title = 'Application Rejected';
      description = 'Unfortunately, your application was rejected. Please contact support or update your application.';
      actionLabel = 'Review Application';
      actionHref = '/customer/apply';
    }

    return (
      <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shadow-sm ${bannerBg}`}>
        <div className="flex gap-4">
          <div className={`p-3 bg-white rounded-lg shadow-sm ${iconColor}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">{description}</p>
          </div>
        </div>
        {showAction && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-xs whitespace-nowrap shadow-sm"
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  };

  const renderActiveTabContent = () => {
    // If not approved and trying to access a restricted tab, render the Feature Restricted card!
    const restrictedTabs = ['buy-fuel', 'orders', 'transporters'];
    if (!isApproved && restrictedTabs.includes(activeTab)) {
      return (
        <Card className="max-w-2xl mx-auto text-center py-12 px-6 border-dashed border-2 border-slate-200 mt-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Feature Restricted During Onboarding</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Access to {activeTab.replace('-', ' ')} is locked until your onboarding application is approved by a refinery officer.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6 max-w-md mx-auto text-left border border-slate-100">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1">
              <span>Onboarding Status</span>
              <span className="capitalize text-blue-600 font-bold">{applicationStatus.replace('_', ' ')}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  applicationStatus === 'submitted' || applicationStatus === 'under_review' 
                    ? 'bg-amber-500 w-1/2' 
                    : applicationStatus === 'correction_required'
                    ? 'bg-red-500 w-3/4'
                    : 'bg-blue-500 w-1/4'
                }`}
              />
            </div>
          </div>

          {applicationStatus === 'correction_required' ? (
            <Link
              href="/customer/apply"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm shadow"
            >
              Update Registration Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : applicationStatus === 'draft' ? (
            <Link
              href="/customer/apply"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm shadow"
            >
              Complete Onboarding Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="text-slate-500 text-xs bg-amber-50 border border-amber-200 p-3 rounded-lg max-w-md mx-auto">
              Our officer is currently reviewing your company profile. No action is required from your side at this moment.
            </div>
          )}
        </Card>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {renderOnboardingBanner()}
            <SummaryCards 
              creditLimit={creditLimit} 
              availableCredit={availableCredit}
              lastOrderQuantity={orders[0]?.quantity || 0}
              lastOrderDate={orders[0]?.createdAt || ''}
              lastOrderProduct={orders[0]?.product || 'HSD'}
              isApproved={isApproved}
            />

            {/* Split grid for a professional workspace layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Center Column (Active Orders and Alerts summary) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Orders Summary */}
                <Card>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      Recent Orders
                    </h3>
                    {isApproved && (
                      <Link href="/customer/dashboard?tab=orders" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                        View all orders <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  
                  {(!isApproved || orders.length === 0) ? (
                    <p className="text-slate-500 text-sm py-4 text-center">No active orders found.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id || order.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{order.orderId || order.id} &bull; {order.product}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ETA: {new Date(order.deliveryETA).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{order.quantity.toLocaleString()} L</p>
                            <Badge 
                              variant={order.status === 'processing' ? 'info' : order.status === 'in_transit' ? 'warning' : 'success'} 
                              size="sm"
                              className="mt-1"
                            >
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Smart Alerts Summary */}
                <Card>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      Recent Alerts
                    </h3>
                    {isApproved && alerts.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500">
                        {alerts.length} Active
                      </span>
                    )}
                  </div>
                  
                  {(!isApproved || alerts.length === 0) ? (
                    <p className="text-slate-500 text-sm py-4 text-center">No alerts requiring attention.</p>
                  ) : (
                    <div className="space-y-2">
                      {alerts.slice(0, 2).map((alert) => (
                        <div key={alert._id || alert.id} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <div className="flex-1 pr-4">
                            <p className="text-sm text-slate-800 font-medium">{alert.message}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{alert.priority.toUpperCase()} priority</p>
                          </div>
                          <button 
                            onClick={() => handleDismissAlert(alert._id || alert.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-2 py-1 rounded"
                          >
                            Dismiss
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column (KPI overview, quick navigation cards) */}
              <div className="space-y-6">
                
                {/* Fuel Procurement Card */}
                {!isApproved ? (
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 opacity-90">
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg text-slate-300">Fuel Procurement</h4>
                      <p className="text-sm text-slate-400">Buy fuel and book logistics instantly once onboarding is complete.</p>
                      <Link
                        href="/customer/apply"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm"
                      >
                        Complete Onboarding
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-0">
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg text-blue-100">Need Fuel?</h4>
                      <p className="text-sm text-slate-300">Get an instant quote and place your order within seconds. Competitive prices and guaranteed delivery.</p>
                      <Link
                        href="/customer/dashboard?tab=buy-fuel"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
                      >
                        Buy Fuel Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                )}

                {/* Rating Card */}
                <Card>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isApproved ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Business Score</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                        {isApproved ? '4.9 / 5.0 (A+)' : 'N/A'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isApproved ? 'Top-tier fuel client standing' : 'Pending onboarding approval'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Info Grid */}
                <Card>
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Operating Hubs</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Primary Site</span>
                      <span className="font-semibold text-slate-900">
                        {isApproved ? 'Mumbai Port Terminal' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Refinery Partners</span>
                      <span className="font-semibold text-slate-900">
                        {isApproved ? 'IOCL, HPCL' : 'Pending Assignment'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Active Transporters</span>
                      <span className="font-semibold text-slate-900">
                        {isApproved ? '3 Partners' : 'None Assigned'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        );

      case 'buy-fuel':
        return <QuickActions onPlaceOrder={handlePlaceOrder} availableCredit={availableCredit} />;

      case 'orders':
        return <ActiveOrders orders={orders} setOrders={setOrders} />;

      case 'transporters':
        return <TransportMarketplace />;

      case 'documents':
        return <DocumentCenter documents={documents} onUploadDocument={handleUploadDocument} />;

      case 'analytics':
        return <ConsumptionAnalytics orders={orders} />;

      case 'services':
        return (
          <div className="space-y-8">
            <BusinessInsights orders={orders} />
            <BusinessServices />
          </div>
        );

      case 'faq':
        return <FAQ />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-500">Section under construction or invalid.</p>
            <Link href="/customer/dashboard?tab=overview" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
              Return to Overview
            </Link>
          </div>
        );
    }
  };

  return (
    <DashboardLayout isApproved={isApproved}>
      <DashboardHeader 
        companyName={companyName} 
        status={applicationStatus} 
        alerts={alerts}
        onDismissAlert={handleDismissAlert}
      />
      {renderActiveTabContent()}
    </DashboardLayout>
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}


