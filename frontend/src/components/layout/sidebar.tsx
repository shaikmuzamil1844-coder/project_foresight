'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  ShoppingCart,
  UploadCloud,
  Bot,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Executive Overview', href: '/', icon: LayoutDashboard },
  { name: 'SKU Demand Forecast', href: '/forecast', icon: TrendingUp },
  { name: 'Inventory Intelligence', href: '/inventory', icon: Boxes },
  { name: 'Reorder Recommendations', href: '/recommendations', icon: ShoppingCart },
  { name: 'Dataset Upload', href: '/upload', icon: UploadCloud },
  { name: 'Ask Foresight AI', href: '/assistant', icon: Bot },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wider text-white bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              FORESIGHT
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              Demand & Inventory AI
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-500 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Model & AI Status Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">XGBoost Engine</p>
            <p className="text-[11px] text-slate-400">Active Horizon: 30D</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
