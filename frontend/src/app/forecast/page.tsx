'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ForecastChart } from '@/components/forecast-chart';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { Product, ForecastResponse } from '@/lib/types';
import { BrainCircuit, TrendingUp, Calendar, Activity, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const drivers = [
  { label: 'Recent sales trend', positive: true },
  { label: 'Weekend demand spike', positive: true },
  { label: 'Seasonal demand', positive: true },
  { label: 'Lead time buffer constraint', positive: false },
];

function ForecastContent() {
  const searchParams = useSearchParams();
  const initialSku = searchParams.get('sku') || 'SKU001';
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>(initialSku);
  const [days, setDays] = useState<number>(30);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getProducts().then((data) => setProducts(data)); }, []);

  const loadForecast = async (sku: string, horizon: number) => {
    setLoading(true);
    try { const res = await api.getSKUForecast(sku, horizon); setForecastData(res); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (selectedSKU) loadForecast(selectedSKU, days); }, [selectedSKU, days]);

  const confidence = forecastData ? Math.max(0, 100 - (forecastData.mape ?? 0)).toFixed(0) : '--';
  const peakDay = forecastData?.forecast?.reduce((max, d) => d.predicted_demand > max.predicted_demand ? d : max, forecastData.forecast[0]);

  return (
    <div style={{ flex: 1 }}>
      <Header title="Demand Forecast" subtitle="XGBoost ML predictions with 95% confidence intervals" />
      <div style={{ padding: '24px 28px 40px' }}>
        {/* Controls */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product SKU</label>
              <select value={selectedSKU} onChange={(e) => setSelectedSKU(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 12px', fontSize: 13.5, color: '#0F172A', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer' }}>
                {products.map((p) => <option key={p.sku_id} value={p.sku_id}>{p.sku_id} — {p.product_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Horizon</label>
              <div className="pill-group">
                {[7, 14, 30, 90].map((h) => (
                  <button key={h} onClick={() => setDays(h)} className={`pill-btn${days === h ? ' active' : ''}`}>{h}D</button>
                ))}
              </div>
            </div>
          </div>
          {forecastData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RiskBadge level={forecastData.risk_level} />
              <Link href="/recommendations" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: 12.5, border: '1px solid #C7D2FE', textDecoration: 'none' }}>
                <ShoppingCart size={13} /> Order {forecastData.recommended_order_quantity} Units
              </Link>
            </div>
          )}
        </div>

        {/* Metrics Row */}
        {forecastData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            <MetricCard icon={<BrainCircuit size={16} color="#4F46E5" />} label="Model" value="XGBoost" sub="Lag + Rolling Stats" />
            <MetricCard icon={<Activity size={16} color="#059669" />} label="MAE" value={`${forecastData.mae} u`} sub="Mean absolute error" />
            <MetricCard icon={<TrendingUp size={16} color="#D97706" />} label="RMSE" value={`${forecastData.rmse} u`} sub="Root mean square" />
            <MetricCard icon={<Calendar size={16} color="#7C3AED" />} label="Accuracy" value={`${confidence}%`} sub={`MAPE: ${forecastData.mape}%`} accent="#7C3AED" />
          </div>
        )}

        {/* Chart + Side Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                {forecastData?.product_name ?? '—'} ({forecastData?.sku_id ?? '—'}) — {days}-Day Forecast
              </h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Historical sales vs AI projected demand with confidence band</p>
            </div>
            {loading
              ? <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Running ML model...</div>
              : forecastData && <ForecastChart data={forecastData.forecast} />
            }
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Forecast Summary</h4>
              {forecastData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SummaryRow label="Expected Demand" value={`${forecastData.predicted_total_demand?.toLocaleString() ?? '--'} units`} />
                  <SummaryRow label="Peak Demand Day" value={peakDay?.date?.slice(5) ?? '--'} accent />
                  <SummaryRow label="Average Daily" value={`${((forecastData.predicted_total_demand ?? 0) / days).toFixed(0)} units`} />
                  <SummaryRow label="Forecast Confidence" value={`${confidence}%`} accent />
                </div>
              ) : <div style={{ color: '#94A3B8', fontSize: 13 }}>Select a SKU to view forecast.</div>}
            </div>

            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>✨ Why did AI predict this?</h4>
              <p style={{ fontSize: 11.5, color: '#94A3B8', marginBottom: 12 }}>Key prediction drivers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {drivers.map((d) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: d.positive ? '#F0FDF4' : '#FFF1F2', border: `1px solid ${d.positive ? '#A7F3D0' : '#FFE4E6'}` }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.positive ? '#059669' : '#DC2626' }}>{d.positive ? '↑' : '↓'}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: d.positive ? '#059669' : '#DC2626' }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Loading forecast...</div>}>
      <ForecastContent />
    </Suspense>
  );
}

const MetricCard = ({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: string }) => (
  <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent ?? '#0F172A' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>
    </div>
  </div>
);

const SummaryRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
    <span style={{ fontSize: 12.5, color: '#64748B' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: accent ? '#4F46E5' : '#0F172A' }}>{value}</span>
  </div>
);
