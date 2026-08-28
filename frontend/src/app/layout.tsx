import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';

export const metadata = {
  title: 'Project FORESIGHT – AI-Powered Demand & Inventory Intelligence Platform',
  description: 'AI-driven SKU demand forecasting, stockout risk matrix, and automated purchase recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
