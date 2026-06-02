import React, { useState } from 'react';
import { Card } from './Card';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0 py-3.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-semibold text-slate-800 text-sm">{question}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'transform rotate-180 text-blue-500' : ''}`} />
      </button>
      
      {isOpen && (
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100/50">
          {answer}
        </p>
      )}
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      question: 'How do I request an expansion of my credit limit?',
      answer: 'To apply for a higher credit limit, navigate to Document Center and upload your latest audited GST invoices or bank statements. Our compliance team will review your credit score and update your limit within 24-48 business hours.'
    },
    {
      question: 'What is the estimated delivery time for HSD (Diesel) orders?',
      answer: 'Standard HSD orders are loaded at refinery terminals and dispatched within 24 hours. The average delivery time is 2-3 business days depending on site proximity. You can track dispatches live using the Track Order panel.'
    },
    {
      question: 'How do I access and download invoice receipts?',
      answer: 'All cleared invoice receipts are stored securely in the Document Center. Go to the Documents tab, locate the specific invoice ID, and click Download. You will receive a clean PDF receipt instantly.'
    },
    {
      question: 'What happens if an order exceeds my available credit?',
      answer: 'If the total cost of fuel exceeds your available credit, the portal will restrict order confirmation. You can resolve this by clearing outstanding invoice balances, depositing security funds, or uploading new financial documentation to request a limit expansion.'
    },
    {
      question: 'How do I contact refinery logistics directly?',
      answer: 'For emergency fleet questions, open the booked shipment terminal in your orders history. You will find driver telemetry feed details, active logistics contacts, and carrier partner support hotlines.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-slate-500 mt-1">Quick self-service solutions and operating instructions for fuel procurement.</p>
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </Card>
    </div>
  );
}
