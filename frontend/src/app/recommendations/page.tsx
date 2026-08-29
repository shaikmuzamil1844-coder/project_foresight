'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { RiskItem } from '@/lib/types';
import { ChevronDown, ChevronRight, Package, ShoppingCart, CheckCircle } from 'lucide-react';

export default function RecommendationsPage() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [approved, setApproved] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getRiskMatrix().then((data) => {
      setItems(data.filter((r) => r.recommended_quantity > 0).sort((a, b) => a.days_to_stockout - b.days_to_stockout));
      setLoading(false);
    });
  }, []);

  const totalCost = items.reduce((sum, i) => sum + i.recommended_purchase_cost, 0);

  return (
    <div style={{ flex: 1 }}>
      <Header title="Reorder Center" subtitle="AI-generated purchase recommendations based on ROP & safety stock" />
      <div style={{ padding: '24px 28px 40px' }}>

        {/* Summary Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={22} color="#4F46E5" />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>₹{(totalCost / 100000).toFixed(2)}L</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Estimated Purchase Value</div>
            </div>
          </div>
          <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} color="#D97706" />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>{items.length}</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Products Requiring Action</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>AI Purchase Recommendations</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading recommendations...</div>
          ) : (
            <div>
              {/* Header Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 90px 90px 120px 100px 120px', gap: 0, padding: '10px 20px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                {['SKU', 'Product', 'Stock', 'Demand/D', 'Risk', 'AI Action', 'Est. Cost', ''].map((h) => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {items.map((item) => {
                const isExpanded = expanded === item.sku_id;
                const isApproved = approved.has(item.sku_id);
                return (
                  <div key={item.sku_id}>
                    {/* Main Row */}
                    <div
                      onClick={() => setExpanded(isExpanded ? null : item.sku_id)}
                      style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 90px 90px 120px 100px 120px', gap: 0, padding: '14px 20px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', background: isExpanded ? '#FAFBFF' : 'transparent', transition: 'background 0.15s' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366F1', fontSize: 13 }}>{item.sku_id}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>{item.product_name}</div>
                        <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{item.category}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', alignSelf: 'center' }}>{item.current_stock}</div>
                      <div style={{ fontSize: 13.5, color: '#64748B', alignSelf: 'center' }}>{item.avg_daily_demand.toFixed(1)}</div>
                      <div style={{ alignSelf: 'center' }}><RiskBadge level={item.risk_level} /></div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#4F46E5', alignSelf: 'center' }}>Order {item.recommended_quantity}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', alignSelf: 'center' }}>₹{item.recommended_purchase_cost.toLocaleString()}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {isApproved ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#059669', fontWeight: 700 }}><CheckCircle size={14} /> Approved</span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setApproved((prev) => new Set([...prev, item.sku_id])); }}
                            style={{ padding: '5px 12px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Approve
                          </button>
                        )}
                        {isExpanded ? <ChevronDown size={14} color="#94A3B8" /> : <ChevronRight size={14} color="#94A3B8" />}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div style={{ background: '#FAFBFF', borderBottom: '1px solid #E2E8F0', padding: '16px 20px 18px 100px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why Reorder?</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 520 }}>
                          <DetailRow label="Current Stock" value={`${item.current_stock} units`} />
                          <DetailRow label="Forecast Demand" value={`${(item.avg_daily_demand * 30).toFixed(0)} units/30d`} />
                          <DetailRow label="Lead Time" value={`${item.lead_time_days} days`} />
                          <DetailRow label="Safety Stock" value={`${item.safety_stock.toFixed(0)} units`} />
                          <DetailRow label="Reorder Point" value={`${item.reorder_point.toFixed(0)} units`} />
                          <DetailRow label="Recommended Qty" value={`${item.recommended_quantity} units`} highlight />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{ padding: '8px 12px', borderRadius: 8, background: highlight ? '#EEF2FF' : '#F8FAFC', border: `1px solid ${highlight ? '#C7D2FE' : '#E2E8F0'}` }}>
    <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#4F46E5' : '#0F172A', marginTop: 2 }}>{value}</div>
  </div>
);
