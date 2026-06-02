import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { mockDashboardData } from '@/lib/dashboard-mock-data';
import { X, TrendingDown, AlertCircle, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

interface Alert {
  id: number;
  type: string;
  message: string;
  priority: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
}

export function SmartAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_alert':
        return <TrendingDown className="w-5 h-5 text-blue-500" />;
      case 'consumption_alert':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'invoice_alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'credit_alert':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleDismiss = (id: number) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const filteredAlerts = mockDashboardData.alerts.filter(
    alert => !dismissedAlerts.includes(alert.id)
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div id="alerts" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Smart Alerts</h2>
        {filteredAlerts.length > 0 && (
          <span className="text-sm text-slate-600">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredAlerts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-900 font-semibold">All caught up!</p>
            <p className="text-slate-600 text-sm mt-1">No new alerts at the moment</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatTime(alert.timestamp)}</p>
                    </div>
                    <Badge
                      variant={alert.priority === 'error' ? 'error' : alert.priority === 'warning' ? 'warning' : alert.priority === 'success' ? 'success' : 'info'}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
