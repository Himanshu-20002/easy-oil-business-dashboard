import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '../components/SessionProvider';

export const metadata: Metadata = {
  title: 'EasyOil | B2B Customer Onboarding Portal',
  description: 'Digital Onboarding & Compliance Portal for Industrial and Commercial Customers',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
