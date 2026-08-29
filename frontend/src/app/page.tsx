'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { KPICard } from '@/components/kpi-card';
import { SalesChart } from '@/components/sales-chart';
import { ActionCenter } from '@/components/action-center';
import { api } from '@/lib/api';
import { DashboardSummary, SalesTrendItem, RiskItem } from '@/lib/types';
import { DollarSign, Boxes, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([]);
  const [riskMatrix, setRiskMatrix] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, riskRes] = await Promise.all([
        api.getDashboardSummary(), api.getSalesTrend(), api.getRiskMatrix(),
      ]);
      setSummary(sumRes); setSalesTrend(trendRes); setRiskMatrix(riskRes);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const alertCount = (summary?.high_risk_skus_count ?? 0) + (summary?.medium_risk_skus_count ?? 0);
  const aiSavings = Math.round((summary?.recommended_purchase_value ?? 0) * 0.138);

  return (
    <div style={{ flex: 1 }}>
      <Header title="Overview" subtitle="AI-powered demand & inventory intelligence" alertCount={alertCount} onRefresh={loadData} />

      <div style={{ padding: '24px 28px 40px' }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <KPICard
            title="30-Day Revenue"
            value={`₹${((summary?.total_revenue_30d ?? 0) / 100000).toFixed(1)}L`}
            subtitle={`${(summary?.total_sales_volume_30d ?? 0).toLocaleString()} units sold`}
            trend={12.4}
            icon={DollarSign}
            color="indigo"
          />
          <KPICard
            title="Total Inventory"
            value={(summary?.total_inventory ?? 0).toLocaleString()}
            subtitle={`${summary?.total_skus ?? 0} active SKUs`}
            trend={-4.2}
            icon={Boxes}
            color="blue"
          />
          <KPICard
            title="Stockout Risk"
            value={`${summary?.high_risk_skus_count ?? 0} SKUs`}
            subtitle={`${summary?.medium_risk_skus_count ?? 0} at warning level`}
            trend={3}
            icon={AlertTriangle}
            color="rose"
          />
          <KPICard
            title="AI Savings Est."
            value={`₹${(aiSavings / 100000).toFixed(2)}L`}
            subtitle="Via optimized reorder timing"
            trend={18.6}
            icon={Sparkles}
            color="emerald"
          />
        </div>

        {/* AI Action Center */}
        {!loading && <ActionCenter riskItems={riskMatrix} />}

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Sales Trend */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Historical Sales Trajectory</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Daily aggregate across all categories</p>
            </div>
            {loading
              ? <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>Loading...</div>
              : <SalesChart data={salesTrend} />
            }
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <ChartLegend color="#6366F1" label="Units Sold" />
              <ChartLegend color="#10B981" label="Revenue" />
            </div>
          </div>

          {/* Risk Summary */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Inventory Risk Breakdown</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>SKU distribution by Safety Stock & ROP</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <RiskRow label="Critical Stockout" value={`${summary?.high_risk_skus_count ?? 0} SKUs`} color="#EF4444" bg="#FEF2F2" border="#FECACA" />
                <RiskRow label="Warning (Near ROP)" value={`${summary?.medium_risk_skus_count ?? 0} SKUs`} color="#D97706" bg="#FFFBEB" border="#FDE68A" />
                <RiskRow label="Optimal Stock" value={`${summary?.low_risk_skus_count ?? 0} SKUs`} color="#10B981" bg="#F0FDF4" border="#A7F3D0" />
                <RiskRow label="Overstock / Excess" value={`${summary?.overstock_skus_count ?? 0} SKUs`} color="#3B82F6" bg="#EFF6FF" border="#BFDBFE" />
              </div>
            </div>
            <Link href="/recommendations" style={{
              marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 10, background: '#6366F1',
              color: '#FFFFFF', fontWeight: 700, fontSize: 13, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              View Reorder Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChartLegend = ({ color, label }: { color: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
    <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
  </div>
);

const RiskRow = ({ label, value, color, bg, border }: { label: string; value: string; color: string; bg: string; border: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
    <span style={{ fontSize: 12.5, fontWeight: 600, color }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
  </div>
);
