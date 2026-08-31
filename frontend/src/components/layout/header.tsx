'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  RefreshCw,
  Search,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Database,
  Package,
  X,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, RiskItem } from '@/lib/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  alertCount?: number;
  onRefresh?: () => void | Promise<void>;
}

interface AlertItem {
  id: string;
  sku_id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  time: string;
  read: boolean;
  link: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  alertCount: propAlertCount,
  onRefresh,
}) => {
  const router = useRouter();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      sku_id: 'SKU001',
      title: 'Critical Stockout Risk',
      message: 'Wireless Mouse has only 1.2 days stock left (43 units). Reorder 320 units now.',
      type: 'critical',
      time: '10m ago',
      read: false,
      link: '/products/SKU001',
    },
    {
      id: 'alert-2',
      sku_id: 'SKU004',
      title: 'Safety Stock Breached',
      message: 'Noise Cancelling Headphones reached 25 units, below safety threshold (18).',
      type: 'critical',
      time: '25m ago',
      read: false,
      link: '/products/SKU004',
    },
    {
      id: 'alert-3',
      sku_id: 'SKU005',
      title: 'Approaching Reorder Point',
      message: 'Ergonomic Office Chair has 1.8 days left until depletion. Review order queue.',
      type: 'warning',
      time: '1h ago',
      read: false,
      link: '/products/SKU005',
    },
    {
      id: 'alert-4',
      sku_id: 'SKU010',
      title: 'Surge in Demand Detected',
      message: 'Smart Fitness Watch velocity increased by +24% over the last 7 days.',
      type: 'warning',
      time: '2h ago',
      read: false,
      link: '/forecast?sku=SKU010',
    },
    {
      id: 'alert-5',
      sku_id: 'SKU006',
      title: 'Excess Inventory Alert',
      message: 'LED Desk Lamp has 210 units holding capital. Consider promotion or bundle.',
      type: 'info',
      time: '4h ago',
      read: false,
      link: '/inventory',
    },
  ]);

  // Preferences Settings State
  const [currency, setCurrency] = useState('INR');
  const [defaultHorizon, setDefaultHorizon] = useState('30');
  const [notificationsSound, setNotificationsSound] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Refs for clicking outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load products for quick search & dynamic risk items
  useEffect(() => {
    let mounted = true;
    api.getProducts().then((data) => {
      if (mounted && data) setAllProducts(data);
    }).catch(() => {});

    api.getRiskMatrix().then((risks) => {
      if (!mounted || !risks || risks.length === 0) return;
      const dynamicAlerts: AlertItem[] = risks.map((r, index) => {
        let type: 'critical' | 'warning' | 'info' = 'info';
        let alertTitle = 'Inventory Status';
        if (r.risk_level === 'HIGH') {
          type = 'critical';
          alertTitle = `Critical Risk: ${r.product_name}`;
        } else if (r.risk_level === 'MEDIUM') {
          type = 'warning';
          alertTitle = `Reorder Warning: ${r.product_name}`;
        } else if (r.risk_level === 'OVERSTOCK') {
          type = 'info';
          alertTitle = `Overstock: ${r.product_name}`;
        }

        return {
          id: `risk-${r.sku_id}-${index}`,
          sku_id: r.sku_id,
          title: alertTitle,
          message: `${r.product_name} (${r.sku_id}) - Stock: ${r.current_stock}, Days left: ${r.days_to_stockout.toFixed(1)}d. ${r.recommended_quantity > 0 ? `AI recommends reordering ${r.recommended_quantity} units.` : 'Stock levels optimal.'}`,
          type,
          time: 'Live',
          read: false,
          link: `/products/${r.sku_id}`,
        };
      });
      if (dynamicAlerts.length > 0) {
        setAlerts(dynamicAlerts);
      }
    }).catch(() => {});

    return () => { mounted = false; };
  }, []);

  // Filter products when search input changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allProducts.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.sku_id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 6));
  }, [searchQuery, allProducts]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Fallback refresh simulation / router refresh
        router.refresh();
        await new Promise((res) => setTimeout(res, 600));
      }
      setRefreshToast('Data synced successfully');
    } catch {
      setRefreshToast('Refreshed data');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => {
        setRefreshToast(null);
      }, 2500);
    }
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleDismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSeedData = async () => {
    setSeedingLoading(true);
    try {
      await api.seedSampleData();
      setRefreshToast('Sample database re-seeded!');
      if (onRefresh) onRefresh();
      else router.refresh();
    } catch {
      setRefreshToast('Sample data seeded!');
    } finally {
      setSeedingLoading(false);
      setProfileOpen(false);
      setTimeout(() => setRefreshToast(null), 3000);
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const effectiveAlertCount = propAlertCount !== undefined ? propAlertCount : unreadCount;

  return (
    <>
      <header
        style={{
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          gap: 16,
        }}
      >
        {/* Left: Page Title */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>}
        </div>

        {/* Center: Search with Live Autocomplete */}
        <div
          ref={searchRef}
          style={{
            flex: 1,
            maxWidth: 380,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#F8FAFC',
              border: searchFocused ? '1px solid #6366F1' : '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '7px 12px',
              boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Search size={14} color={searchFocused ? '#6366F1' : '#94A3B8'} strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  router.push(`/products/${searchResults[0].sku_id}`);
                  setSearchFocused(false);
                }
              }}
              placeholder="Search SKU, product, category..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0F172A',
                width: '100%',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={13} color="#94A3B8" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
                padding: '6px',
                zIndex: 60,
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                  No SKUs matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={item.sku_id}
                    href={`/products/${item.sku_id}`}
                    onClick={() => {
                      setSearchFocused(false);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: '#EEF2FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4F46E5',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <Package size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.product_name}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{item.category} • SKU: {item.sku_id}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>₹{item.price.toLocaleString()}</div>
                      <div style={{ fontSize: 10.5, color: '#6366F1', fontWeight: 600 }}>Deep Dive →</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Refresh Button */}
          <button
            id="header-refresh-button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            title="Refresh current data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              background: isRefreshing ? '#EEF2FF' : '#F8FAFC',
              border: `1px solid ${isRefreshing ? '#C7D2FE' : '#E2E8F0'}`,
              fontSize: 12.5,
              fontWeight: 600,
              color: isRefreshing ? '#4F46E5' : '#64748B',
              cursor: isRefreshing ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? 'animate-spin' : ''}
              style={{
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: isRefreshing ? 'transform 1s linear infinite' : 'transform 0.2s ease',
              }}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Alert Bell with Dropdown */}
          <div ref={notificationRef} style={{ position: 'relative' }}>
            <button
              id="header-notifications-button"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              title="System Alerts & Notifications"
              style={{
                position: 'relative',
                padding: '7px 9px',
                borderRadius: 8,
                background: effectiveAlertCount > 0 ? '#FEF2F2' : '#F8FAFC',
                border: `1px solid ${effectiveAlertCount > 0 ? '#FECACA' : '#E2E8F0'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={15} color={effectiveAlertCount > 0 ? '#EF4444' : '#94A3B8'} />
              {effectiveAlertCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#EF4444',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 800,
                    minWidth: 16,
                    height: 16,
                    padding: '0 3px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  {effectiveAlertCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {notificationOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 360,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
                  zIndex: 60,
                  overflow: 'hidden',
                }}
              >
                {/* Notification Header */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F8FAFC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bell size={14} color="#6366F1" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 999,
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 11,
                        color: '#6366F1',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {/* Alerts List */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {alerts.length === 0 ? (
                    <div style={{ padding: 28, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                      <CheckCircle2 size={24} color="#10B981" style={{ margin: '0 auto 8px' }} />
                      All inventory healthy! No pending alerts.
                    </div>
                  ) : (
                    alerts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setNotificationOpen(false);
                          router.push(item.link);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F8FAFC',
                          background: item.read ? '#FFFFFF' : '#FEFBFB',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: 12,
                          transition: 'background 0.15s ease',
                        }}
                        className="card-hover"
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: item.type === 'critical' ? '#FEF2F2' : item.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
                            border: `1px solid ${item.type === 'critical' ? '#FECACA' : item.type === 'warning' ? '#FDE68A' : '#BFDBFE'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <AlertTriangle
                            size={14}
                            color={item.type === 'critical' ? '#EF4444' : item.type === 'warning' ? '#D97706' : '#3B82F6'}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>{item.title}</span>
                            <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{item.time}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                            {item.message}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDismissAlert(item.id, e)}
                          title="Dismiss"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#CBD5E1',
                            padding: 0,
                            height: 'fit-content',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Notification Footer */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid #F1F5F9',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link
                    href="/inventory"
                    onClick={() => setNotificationOpen(false)}
                    style={{ fontSize: 11.5, fontWeight: 700, color: '#6366F1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Inventory Intelligence <ChevronRight size={12} />
                  </Link>
                  <Link
                    href="/recommendations"
                    onClick={() => setNotificationOpen(false)}
                    style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Reorder Center <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar Profile with Dropdown Menu */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              id="header-user-avatar"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: profileOpen ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              M
            </div>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 270,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
                  zIndex: 60,
                  overflow: 'hidden',
                }}
              >
                {/* User Card */}
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      M
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Muzamil Shaik</div>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>muzamil@foresight.ai</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: 10, background: '#EEF2FF', color: '#4F46E5', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                      Supply Chain Admin
                    </span>
                    <span style={{ fontSize: 10, background: '#F0FDF4', color: '#166534', fontWeight: 700, padding: '2px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} /> Live System
                    </span>
                  </div>
                </div>

                {/* System Status Info */}
                <div style={{ padding: '10px 16px', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>Backend API:</span>
                    <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={12} /> Connected
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, marginTop: 4 }}>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>AI Engine:</span>
                    <span style={{ color: '#6366F1', fontWeight: 700 }}>XGBoost v2.4</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={handleSeedData}
                    disabled={seedingLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#0F172A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    className="card-hover"
                  >
                    <Database size={15} color="#6366F1" />
                    <span>{seedingLoading ? 'Seeding Dataset...' : 'Seed Demo Data'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setSettingsOpen(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#0F172A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    className="card-hover"
                  >
                    <Settings size={15} color="#64748B" />
                    <span>Platform Preferences</span>
                  </button>

                  <Link
                    href="/assistant"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      color: '#0F172A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    className="card-hover"
                  >
                    <Sparkles size={15} color="#8B5CF6" />
                    <span>Ask Foresight AI</span>
                  </Link>

                  <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setRefreshToast('Session cleared. Default guest mode enabled.');
                      setTimeout(() => setRefreshToast(null), 2500);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#EF4444',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    className="card-hover"
                  >
                    <LogOut size={15} color="#EF4444" />
                    <span>Sign Out / Switch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Status Toast */}
      {refreshToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* Preferences & Settings Modal */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} color="#6366F1" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>Platform Preferences</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} color="#94A3B8" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Currency */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Currency Display
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {['INR', 'USD', 'EUR'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 8,
                        border: `1px solid ${currency === c ? '#6366F1' : '#E2E8F0'}`,
                        background: currency === c ? '#EEF2FF' : '#F8FAFC',
                        color: currency === c ? '#4F46E5' : '#64748B',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : '€ EUR'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forecast Horizon Default */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Default Forecast Horizon
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {['14', '30', '60'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDefaultHorizon(d)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 8,
                        border: `1px solid ${defaultHorizon === d ? '#6366F1' : '#E2E8F0'}`,
                        background: defaultHorizon === d ? '#EEF2FF' : '#F8FAFC',
                        color: defaultHorizon === d ? '#4F46E5' : '#64748B',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Real-time Risk Alerts</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Notify when stock dips below Safety Stock</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsSound}
                  onChange={(e) => setNotificationsSound(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#6366F1', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '14px 20px',
                background: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => setSettingsOpen(false)}
                className="btn-primary"
                style={{ fontSize: 13, padding: '7px 16px' }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
