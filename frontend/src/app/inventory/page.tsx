'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { RiskItem } from '@/lib/types';
import { AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [riskMatrix, setRiskMatrix] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRiskMatrix().then((data) => { setRiskMatrix(data); setLoading(false); });
  }, []);

  const high = riskMatrix.filter((r) => r.risk_level === 'HIGH');
  const medium = riskMatrix.filter((r) => r.risk_level === 'MEDIUM');
  const low = riskMatrix.filter((r) => r.risk_level === 'LOW');
  const overstock = riskMatrix.filter((r) => r.risk_level === 'OVERSTOCK');

  return (
    <div style={{ flex: 1 }}>
      <Header title="Inventory Intelligence" subtitle="Risk-classified stock monitoring & reorder alerts" alertCount={high.length} />
      <div style={{ padding: '24px 28px 40px' }}>

        {/* Summary Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          <StripCard label="Critical Risk" count={high.length} color="#EF4444" bg="#FEF2F2" border="#FECACA" />
          <StripCard label="Warning" count={medium.length} color="#D97706" bg="#FFFBEB" border="#FDE68A" />
          <StripCard label="Healthy" count={low.length} color="#10B981" bg="#F0FDF4" border="#A7F3D0" />
          <StripCard label="Overstock" count={overstock.length} color="#3B82F6" bg="#EFF6FF" border="#BFDBFE" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>Loading inventory data...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {high.length > 0 && <RiskSection title="🔴 High Risk — Immediate Action Required" items={high} borderColor="#EF4444" bg="#FFF5F5" />}
            {medium.length > 0 && <RiskSection title="🟠 Medium Risk — Monitor Closely" items={medium} borderColor="#F59E0B" bg="#FFFBF0" />}
            {low.length > 0 && <RiskSection title="🟢 Healthy — Optimal Stock Levels" items={low} borderColor="#10B981" bg="#F7FDF9" />}
            {overstock.length > 0 && <RiskSection title="🔵 Overstock — Excess Capital Locked" items={overstock} borderColor="#3B82F6" bg="#F0F7FF" />}
          </div>
        )}
      </div>
    </div>
  );
}

const StripCard = ({ label, count, color, bg, border }: { label: string; count: number; color: string; bg: string; border: string }) => (
  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px' }}>
    <div style={{ fontSize: 24, fontWeight: 800, color }}>{count}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 2 }}>{label}</div>
  </div>
);

const RiskSection = ({ title, items, borderColor, bg }: { title: string; items: RiskItem[]; borderColor: string; bg: string }) => (
  <div style={{ background: bg, borderRadius: 14, border: `1px solid ${borderColor}22`, overflow: 'hidden' }}>
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}22`, display: 'flex', alignItems: 'center', gap: 8 }}>
      <AlertTriangle size={14} color={borderColor} />
      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{title}</span>
      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>{items.length} SKU{items.length !== 1 ? 's' : ''}</span>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ background: 'transparent' }}>
        <thead>
          <tr>
            <th>SKU</th><th>Product</th><th>Category</th>
            <th style={{ textAlign: 'right' }}>Stock</th>
            <th style={{ textAlign: 'right' }}>Daily Demand</th>
            <th style={{ textAlign: 'right' }}>ROP</th>
            <th>Days Left</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.sku_id}>
              <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366F1' }}>{item.sku_id}</span></td>
              <td><span style={{ fontWeight: 600, color: '#0F172A' }}>{item.product_name}</span></td>
              <td style={{ color: '#64748B' }}>{item.category}</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.current_stock}</td>
              <td style={{ textAlign: 'right', color: '#64748B' }}>{item.avg_daily_demand.toFixed(1)}</td>
              <td style={{ textAlign: 'right', color: '#64748B' }}>{item.reorder_point.toFixed(0)}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} color={item.days_to_stockout < 5 ? '#EF4444' : '#94A3B8'} />
                  <span style={{ fontWeight: 700, color: item.days_to_stockout < 5 ? '#EF4444' : item.days_to_stockout < 14 ? '#D97706' : '#0F172A' }}>
                    {item.days_to_stockout.toFixed(0)}d
                  </span>
                </div>
              </td>
              <td><RiskBadge level={item.risk_level} /></td>
              <td>
                <Link href={`/forecast?sku=${item.sku_id}`} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
                  Forecast <ArrowUpRight size={11} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
