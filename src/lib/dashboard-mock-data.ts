export const mockDashboardData = {
  company: {
    name: 'Fuel Solutions Inc',
    creditLimit: 500000,
    availableCredit: 375000,
  },
  summary: {
    currentCreditLimit: 500000,
    availableCredit: 375000,
    lastOrderQuantity: 5000,
    lastOrderDate: '2026-05-24',
    lastOrderProduct: 'HSD'
  },
  orders: [
    {
      id: 'ORD-001',
      product: 'HSD',
      quantity: 5000,
      status: 'in_transit',
      deliveryETA: '2026-05-31',
      createdAt: '2026-05-28'
    },
    {
      id: 'ORD-002',
      product: 'HSD',
      quantity: 3000,
      status: 'delivered',
      deliveryETA: '2026-05-24',
      createdAt: '2026-05-20'
    },
    {
      id: 'ORD-003',
      product: 'LDO',
      quantity: 2000,
      status: 'processing',
      deliveryETA: '2026-06-05',
      createdAt: '2026-05-29'
    }
  ],
  consumption: [
    { month: 'May', usage: 4000 },
    { month: 'June', usage: 5300 },
    { month: 'July', usage: 6000 }
  ],
  alerts: [
    {
      id: 1,
      type: 'price_alert',
      message: 'Diesel prices dropped by 1.2%',
      priority: 'info',
      timestamp: '2026-05-29T10:30:00'
    },
    {
      id: 2,
      type: 'consumption_alert',
      message: 'Tank refill recommended in 7 days',
      priority: 'warning',
      timestamp: '2026-05-29T08:15:00'
    },
    {
      id: 3,
      type: 'invoice_alert',
      message: 'Invoice #231 due tomorrow',
      priority: 'warning',
      timestamp: '2026-05-28T14:45:00'
    },
    {
      id: 4,
      type: 'credit_alert',
      message: 'Credit limit increased to ₹6,00,000',
      priority: 'success',
      timestamp: '2026-05-28T09:00:00'
    }
  ],
  services: [
    {
      id: 1,
      category: 'Storage Solutions',
      name: 'Storage Tanks',
      description: 'Industrial storage tanks with monitoring',
      icon: 'Droplet'
    },
    {
      id: 2,
      category: 'Insurance',
      name: 'Tank Insurance',
      description: 'Comprehensive tank and fuel coverage',
      icon: 'Shield'
    },
    {
      id: 3,
      category: 'Fleet Services',
      name: 'GPS Tracking',
      description: 'Real-time fleet tracking and analytics',
      icon: 'MapPin'
    },
    {
      id: 4,
      category: 'Equipment',
      name: 'Dispensers',
      description: 'High-precision fuel dispensing equipment',
      icon: 'Zap'
    }
  ],
  kpis: {
    monthlySpend: 125000,
    monthlySpendTrend: 12,
    fuelPurchased: 15000,
    fuelPurchasedTrend: 8,
    savingsAchieved: 18500,
    savingsTrend: 15,
    ordersThisMonth: 8,
    ordersTrend: -5,
    averageDeliveryTime: 2.5
  }
};
