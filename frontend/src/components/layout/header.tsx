'use client';

import React from 'react';
import { Bell, RefreshCw, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  alertCount?: number;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, alertCount = 0, onRefresh }) => {
  return (
    <header style={{
      height: 60,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      gap: 16,
    }}>
      {/* Left: Page Title */}
      <div style={{ minWidth: 0 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{subtitle}</p>}
      </div>

      {/* Center: Search */}
      <div style={{
        flex: 1, maxWidth: 360,
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#F8FAFC', border: '1px solid #E2E8F0',
        borderRadius: 10, padding: '7px 12px',
      }}>
        <Search size={14} color="#94A3B8" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search SKU, product, category..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: '#0F172A', width: '100%',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              fontSize: 12.5, fontWeight: 600, color: '#64748B',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        )}

        {/* Alert Bell */}
        <button style={{
          position: 'relative', padding: 7, borderRadius: 8,
          background: alertCount > 0 ? '#FEF2F2' : '#F8FAFC',
          border: `1px solid ${alertCount > 0 ? '#FECACA' : '#E2E8F0'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={15} color={alertCount > 0 ? '#EF4444' : '#94A3B8'} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#EF4444', color: 'white',
              fontSize: 9, fontWeight: 800,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              {alertCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          flexShrink: 0,
        }}>
          M
        </div>
      </div>
    </header>
  );
};

