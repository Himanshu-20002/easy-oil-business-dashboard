import React from 'react';
import { Card } from './Card';
import { ArrowRight, Droplet, Shield, MapPin, Zap } from 'lucide-react';

interface Service {
  id: number;
  category: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    id: 1,
    category: 'Storage Solutions',
    name: 'Storage Tanks',
    description: 'Industrial storage tanks with monitoring systems',
    icon: <Droplet className="w-6 h-6" />
  },
  {
    id: 2,
    category: 'Insurance',
    name: 'Tank Insurance',
    description: 'Comprehensive tank and fuel coverage',
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 3,
    category: 'Fleet Services',
    name: 'GPS Tracking',
    description: 'Real-time fleet tracking and analytics',
    icon: <MapPin className="w-6 h-6" />
  },
  {
    id: 4,
    category: 'Equipment',
    name: 'Dispensers & Pumps',
    description: 'High-precision fuel dispensing equipment',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 5,
    category: 'Equipment',
    name: 'Flow Meters',
    description: 'Accurate fuel flow measurement systems',
    icon: <Droplet className="w-6 h-6" />
  },
  {
    id: 6,
    category: 'Equipment',
    name: 'Fuel Sensors',
    description: 'Tank level monitoring sensors',
    icon: <Zap className="w-6 h-6" />
  }
];

const groupedServices = services.reduce((acc: Record<string, Service[]>, service) => {
  if (!acc[service.category]) {
    acc[service.category] = [];
  }
  acc[service.category].push(service);
  return acc;
}, {});

export function BusinessServices() {
  return (
    <div id="services" className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Services Marketplace</h2>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{category}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryServices.map((service) => (
              <Card key={service.id} variant="elevated">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{service.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{category}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">{service.description}</p>

                  <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm transition-colors">
                    Request Quote
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
