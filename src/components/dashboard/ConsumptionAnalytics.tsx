import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { mockDashboardData } from '@/lib/dashboard-mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ConsumptionAnalyticsProps {
  orders?: any[];
}

export function ConsumptionAnalytics({ orders }: ConsumptionAnalyticsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasOrders = orders && orders.length > 0;

  const getConsumptionData = () => {
    // Generate the last 6 months dynamically in chronological order
    const dataList: { month: string; usage: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dataList.push({ month: monthName, usage: 0 });
    }

    if (hasOrders) {
      orders.forEach(order => {
        if (!order.createdAt) return;
        const date = new Date(order.createdAt);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const found = dataList.find(item => item.month === monthName);
        if (found) {
          found.usage += Number(order.quantity) || 0;
        }
      });
    }
    
    return dataList;
  };

  const chartData = getConsumptionData();
  const currentUsage = chartData[chartData.length - 1] || { usage: 0 };
  const previousUsage = chartData[chartData.length - 2] || { usage: 0 };
  const trend = previousUsage.usage > 0 ? ((currentUsage.usage - previousUsage.usage) / previousUsage.usage) * 100 : 0;

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 font-medium text-xs">
        Loading analytics engine...
      </div>
    );
  }

  if (!hasOrders) {
    return (
      <div id="analytics" className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Fuel Consumption Analytics</h2>
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Consumption History Available</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Your fuel procurement trends, previous month comparisons, future projections, and smart refill alerts will be computed dynamically once you place your first order.
          </p>
          <a
             href="/customer/dashboard?tab=buy-fuel"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm shadow-md"
          >
            Place Fuel Procurement Order
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div id="analytics" className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Fuel Consumption Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Month */}
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">Current Month Usage</p>
            <p className="text-3xl font-bold text-slate-900">{currentUsage.usage.toLocaleString()} L</p>
            {previousUsage.usage > 0 ? (
              <div className={`flex items-center gap-2 text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                <TrendingUp className="w-4 h-4" />
                {trend.toFixed(1)}% {trend >= 0 ? 'increase' : 'decrease'}
              </div>
            ) : (
              <p className="text-xs text-slate-400">First month of data</p>
            )}
          </div>
        </Card>

        {/* Previous Month */}
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">Previous Month Usage</p>
            <p className="text-3xl font-bold text-slate-900">{previousUsage.usage.toLocaleString()} L</p>
            <p className="text-xs text-slate-500">
              {previousUsage.usage > 0 ? 'Compared to current' : 'No previous history'}
            </p>
          </div>
        </Card>

        {/* Projected */}
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">Projected Consumption</p>
            <p className="text-3xl font-bold text-slate-900">{(currentUsage.usage * 1.1).toFixed(0)} L</p>
            <p className="text-xs text-slate-500">Next 30 days projection</p>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Consumption Trend</h3>
          </div>

          <div className="w-full h-80 pr-4">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value !== undefined && value !== null ? `${Number(value).toLocaleString()} L` : '0 L', 'Usage']}
                />
                <Bar
                  dataKey="usage"
                  fill="url(#colorUsage)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Smart Recommendation</p>
              <p className="text-sm text-amber-700 mt-1">
                Refinery tank capacity analysis active. Place orders to receive predictive refill scheduling.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
