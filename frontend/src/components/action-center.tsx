import React from 'react';
import { RiskItem } from '@/lib/types';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

interface ActionCenterProps {
  riskItems: RiskItem[];
}

export const ActionCenter: React.FC<ActionCenterProps> = ({ riskItems }) => {
  const critical = riskItems.filter((r) => r.risk_level === 'HIGH');
  const warning = riskItems.filter((r) => r.risk_level === 'MEDIUM');
  const overstock = riskItems.filter((r) => r.risk_level === 'OVERSTOCK');
  const total = critical.length + warning.length + overstock.length;

  const topItems = [...critical, ...warning].slice(0, 4);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Hero Banner */}
      <div className="action-center-card" style={{ padding: '20px 24px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ✨ AI Action Center
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
              {total} product{total !== 1 ? 's' : ''} need your attention today
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Chip emoji="🔴" count={critical.length} label="Critical" />
              <Chip emoji="🟠" count={warning.length} label="Warning" />
              <Chip emoji="🔵" count={overstock.length} label="Overstock" />
            </div>
          </div>
          <Link href="/recommendations" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            background: 'rgba(255,255,255,0.2)', borderRadius: 10,
            color: '#FFFFFF', fontWeight: 700, fontSize: 13,
            border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none',
            backdropFilter: 'blur(4px)', transition: 'background 0.15s',
            whiteSpace: 'nowrap', alignSelf: 'flex-start',
          }}>
            Review Recommendations <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Decision Table */}
      {topItems.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 0', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12 }}>
              <AlertTriangle size={14} color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>AI Recommended Actions</span>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Issue</th>
                <th>Impact</th>
                <th>AI Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item) => {
                const isCritical = item.risk_level === 'HIGH';
                return (
                  <tr key={item.sku_id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366F1' }}>{item.sku_id}</span></td>
                    <td><span style={{ fontWeight: 600, color: '#0F172A' }}>{item.product_name}</span></td>
                    <td>
                      <span style={{ fontSize: 12.5, color: isCritical ? '#DC2626' : '#D97706' }}>
                        Stockout in {item.days_to_stockout.toFixed(0)} days
                      </span>
                    </td>
                    <td>
                      <span className={isCritical ? 'badge-critical' : 'badge-warning'}>
                        {isCritical ? 'High' : 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>
                        Order {item.recommended_quantity} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/forecast?sku=${item.sku_id}`} style={{ fontSize: 12, color: '#6366F1', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        <TrendingUp size={12} /> Forecast
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Chip = ({ emoji, count, label }: { emoji: string; count: number; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)' }}>
    <span style={{ fontSize: 12 }}>{emoji}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{count}</span>
    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
  </div>
);
