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
  Package,
  Zap,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Demand Forecast', href: '/forecast', icon: TrendingUp },
  { name: 'Inventory Intelligence', href: '/inventory', icon: Boxes },
  { name: 'Reorder Center', href: '/recommendations', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Data Management', href: '/upload', icon: UploadCloud },
  { name: 'Ask Foresight AI', href: '/assistant', icon: Bot },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 236,
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      <div>
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              flexShrink: 0,
            }}>
              <Zap size={16} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '0.04em' }}>
                FORESIGHT
              </div>
              <div style={{ fontSize: 10, color: '#6366F1', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Inventory AI
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 10px' }}>
            Main Menu
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="sidebar-nav-item"
                style={isActive ? {
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontWeight: 600,
                } : {}}
              >
                <Icon
                  size={16}
                  color={isActive ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span style={{ fontSize: 13.5 }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #F1F5F9' }}>
        {/* Model Status */}
        <div style={{
          background: '#F8FAFC', borderRadius: 10, padding: '10px 12px',
          border: '1px solid #E2E8F0', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={13} color="#6366F1" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>XGBoost Engine</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>30-Day Horizon Active</div>
          </div>
        </div>

        {/* Avatar */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10,
            transition: 'background 0.15s',
            textDecoration: 'none',
          }}
          className="card-hover"
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            M
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Muzamil
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Analyst</div>
          </div>
          <Settings size={14} color="#CBD5E1" />
        </Link>
      </div>
    </aside>
  );
};

