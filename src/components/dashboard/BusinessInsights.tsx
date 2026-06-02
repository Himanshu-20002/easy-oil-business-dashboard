import React from 'react';
import { Card } from './Card';
import { mockDashboardData } from '@/lib/dashboard-mock-data';
import { TrendingUp, TrendingDown, DollarSign, Droplet, Gift, ShoppingCart, Zap } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  unit?: string;
}

function KPICard({ title, value, trend, icon, unit }: KPICardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {typeof value === 'number' 
              ? title.includes('Spend') || title.includes('Savings')
                ? `₹${(value / 1000).toFixed(0)}K`
                : `${value.toLocaleString()}`
              : value
            }
          </p>
          {unit && <span className="text-sm text-slate-600">{unit}</span>}
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend)}% {isPositive ? 'increase' : 'decrease'}
          </div>
        )}
      </div>
    </Card>
  );
}

export function BusinessInsights({ orders = [] }: { orders?: any[] }) {
  const hasOrders = orders.length > 0;

  // Calculate dynamic KPIs from database orders
  let totalFuel = 0;
  let totalSpend = 0;
  let ordersThisMonth = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  orders.forEach(order => {
    const qty = Number(order.quantity) || 0;
    totalFuel += qty;

    const rate = order.product === 'HSD' ? 85 : order.product === 'LDO' ? 78 : 92;
    const cost = qty * rate;
    totalSpend += cost;

    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        ordersThisMonth += 1;
      }
    }
  });

  const savingsAchieved = totalSpend * 0.045; // 4.5% standard wholesale discount

  return (
    <div id="kpis" className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Insights & KPIs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Monthly Spend"
          value={totalSpend}
          trend={hasOrders ? 12 : undefined}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <KPICard
          title="Fuel Purchased"
          value={totalFuel}
          trend={hasOrders ? 8 : undefined}
          icon={<Droplet className="w-5 h-5" />}
          unit="Litres"
        />

        <KPICard
          title="Savings Achieved"
          value={savingsAchieved}
          trend={hasOrders ? 15 : undefined}
          icon={<Gift className="w-5 h-5" />}
        />

        <KPICard
          title="Orders This Month"
          value={ordersThisMonth}
          icon={<ShoppingCart className="w-5 h-5" />}
        />

        <KPICard
          title="Avg Delivery Time"
          value={hasOrders ? "2.5 days" : "N/A"}
          icon={<Zap className="w-5 h-5" />}
        />

        <Card>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">Performance Rating</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full ${
                      !hasOrders 
                        ? 'bg-slate-200' 
                        : i < 4 
                        ? 'bg-yellow-400' 
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {hasOrders ? "4.0" : "N/A"}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {hasOrders ? "Excellent standing" : "Pending account transactions"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
