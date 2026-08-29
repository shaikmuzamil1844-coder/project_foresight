"use client";

import { useEffect, useState, use } from 'react';
import { Header } from '@/components/layout/header';
import { Package, ArrowLeft, TrendingUp, AlertTriangle, ShieldCheck, Clock, ShoppingCart, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, RiskItem, ForecastResponse } from '@/lib/types';
import { ForecastChart } from '@/components/forecast-chart';

export default function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const resolvedParams = use(params);
  const skuId = resolvedParams.sku || 'SKU001';

  const [product, setProduct] = useState<Product | null>(null);
  const [riskItem, setRiskItem] = useState<RiskItem | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, risks, fc] = await Promise.all([
          api.getProducts(),
          api.getRiskMatrix(),
          api.getSKUForecast(skuId, 30),
        ]);

        const foundProd = prods.find((p) => p.sku_id === skuId) || prods[0];
        const foundRisk = risks.find((r) => r.sku_id === skuId) || risks[0];

        setProduct(foundProd);
        setRiskItem(foundRisk);
        setForecast(fc);
      } catch (e) {
        console.error('Failed to load product detail', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [skuId]);

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Header title={`SKU Deep-Dive: ${skuId}`} subtitle="Granular inventory health, forecast trajectory & AI recommendation" />

      <div style={{ padding: '24px 28px' }}>
        {/* Back Link */}
        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#6366F1',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={16} /> Back to Products Catalog
        </Link>

        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            Loading SKU intelligence...
          </div>
        ) : (
          <>
            {/* Top Product Summary Card */}
            <div
              className="card"
              style={{
                padding: '24px 28px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #C7D2FE',
                  }}
                >
                  <Package size={28} color="#4F46E5" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{product?.product_name}</h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: '1px solid #C7D2FE',
                      }}
                    >
                      {product?.category}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: riskItem?.risk_level === 'HIGH' ? '#FEF2F2' : riskItem?.risk_level === 'MEDIUM' ? '#FFFBEB' : '#F0FDF4',
                        color: riskItem?.risk_level === 'HIGH' ? '#EF4444' : riskItem?.risk_level === 'MEDIUM' ? '#D97706' : '#10B981',
                        border: `1px solid ${riskItem?.risk_level === 'HIGH' ? '#FECACA' : riskItem?.risk_level === 'MEDIUM' ? '#FDE68A' : '#A7F3D0'}`,
                      }}
                    >
                      {riskItem?.risk_level} RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '20px' }}>
                    <span>SKU Code: <strong>{product?.sku_id}</strong></span>
                    <span>Supplier: <strong>{product?.supplier}</strong></span>
                    <span>Lead Time: <strong>{product?.lead_time} Days</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>₹{product?.price.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Unit Wholesale Price</div>
              </div>
            </div>

            {/* Inventory Health Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Current Warehouse Stock</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{riskItem?.current_stock} Units</div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>Avg Demand: {riskItem?.avg_daily_demand}/day</div>
              </div>

              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Est. Days to Stockout</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: riskItem && riskItem.days_to_stockout < 3 ? '#EF4444' : '#0F172A', marginTop: '6px' }}>
                  {riskItem?.days_to_stockout} Days
                </div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>Lead Time: {riskItem?.lead_time_days} days</div>
              </div>

              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Reorder Point (ROP)</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{riskItem?.reorder_point} Units</div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>Safety Stock: {riskItem?.safety_stock}</div>
              </div>

              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Recommended Reorder</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#4F46E5', marginTop: '6px' }}>{riskItem?.recommended_quantity} Units</div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>Est. Cost: ₹{riskItem?.recommended_purchase_cost.toLocaleString()}</div>
              </div>
            </div>

            {/* Demand Forecast Chart & AI Insight Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div className="card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                  30-Day Demand Trajectory Forecast
                </h3>
                {forecast && <ForecastChart data={forecast.forecast} />}
              </div>

              {/* AI Recommendation Box */}
              <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color="#4F46E5" />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>AI Purchase Recommendation</h3>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                      {riskItem?.recommended_quantity && riskItem.recommended_quantity > 0
                        ? `🚨 Action Required: Current stock of ${riskItem.current_stock} units is below the calculated Reorder Point of ${riskItem.reorder_point} units. At current daily demand (${riskItem.avg_daily_demand} units/day), stockout is projected in ${riskItem.days_to_stockout} days.`
                        : `✅ Stock Health Optimal: Current stock level of ${riskItem?.current_stock} units is sufficient to cover lead time demand and safety buffer.`}
                    </p>
                  </div>
                </div>

                {riskItem?.recommended_quantity && riskItem.recommended_quantity > 0 ? (
                  <button
                    onClick={() => alert(`Purchase Order created for ${product?.product_name} (${riskItem.recommended_quantity} units @ ₹${riskItem.recommended_purchase_cost.toLocaleString()})!`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                    }}
                  >
                    <ShoppingCart size={16} /> Place Recommended Order (₹{riskItem.recommended_purchase_cost.toLocaleString()})
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px', background: '#F0FDF4', borderRadius: '10px', color: '#059669', fontSize: '13px', fontWeight: 700 }}>
                    No Reorder Needed Currently
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}