import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  creditLimit?: number;
  availableCredit?: number;
  lastOrderQuantity?: number;
  lastOrderDate?: string;
  lastOrderProduct?: string;
  isApproved?: boolean;
}

export function SummaryCards({
  creditLimit = 500000,
  availableCredit = 375000,
  lastOrderQuantity = 5000,
  lastOrderDate = '2026-05-24',
  lastOrderProduct = 'HSD',
  isApproved = true
}: SummaryCardsProps) {
  const finalCreditLimit = isApproved ? creditLimit : 0;
  const finalAvailableCredit = isApproved ? availableCredit : 0;

  const usedCredit = finalCreditLimit - finalAvailableCredit;
  const creditUsagePercent = finalCreditLimit > 0 ? (usedCredit / finalCreditLimit) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Current Credit Limit */}
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">Current Credit Limit</p>
          <p className="text-2xl font-bold text-slate-900">
            {isApproved ? formatCurrency(finalCreditLimit) : '₹0'}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
              />
            </div>
            <span className="font-semibold">{creditUsagePercent.toFixed(0)}%</span>
          </div>
        </div>
      </Card>

      {/* Available Credit */}
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">Available Credit</p>
          <p className={`text-2xl font-bold ${isApproved ? 'text-green-600' : 'text-slate-400'}`}>
            {isApproved ? formatCurrency(finalAvailableCredit) : '₹0'}
          </p>
          <p className="text-xs text-slate-500">
            {isApproved ? 'Ready to use' : 'Pending verification'}
          </p>
        </div>
      </Card>

      {/* Last Order */}
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">Last Order</p>
          <p className="text-2xl font-bold text-slate-900">
            {isApproved && lastOrderQuantity > 0 ? `${lastOrderQuantity.toLocaleString()} L` : '0 L'}
          </p>
          <p className="text-xs text-slate-500">
            {isApproved && lastOrderQuantity > 0 
              ? `${lastOrderProduct} - ${new Date(lastOrderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` 
              : 'No orders placed yet'}
          </p>
        </div>
      </Card>

      {/* Account Status */}
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">Account Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isApproved ? 'bg-green-500' : 'bg-amber-500'}`} />
            <p className="text-lg font-bold text-slate-900">
              {isApproved ? 'Active' : 'Pending Approval'}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {isApproved ? 'All systems operational' : 'Onboarding in progress'}
          </p>
        </div>
      </Card>
    </div>
  );
}
