'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ForecastChart } from '@/components/forecast-chart';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { Product, ForecastResponse } from '@/lib/types';
import { BrainCircuit, Calendar, Layers, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function ForecastPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('SKU001');
  const [days, setDays] = useState<number>(30);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data);
      if (data.length > 0) setSelectedSKU(data[0].sku_id);
    });
  }, []);

  const loadForecast = async (sku: string, horizon: number) => {
    setLoading(true);
    try {
      const res = await api.getSKUForecast(sku, horizon);
      setForecastData(res);
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSKU) {
      loadForecast(selectedSKU, days);
    }
  }, [selectedSKU, days]);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="SKU Demand Forecasting Engine"
        subtitle="Multi-horizon XGBoost machine learning predictions with 95% confidence intervals."
      />

      <div className="px-8 mt-6 space-y-6">
        {/* SKU Selector Controls */}
        <div className="glass-card p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Select Product SKU
              </label>
              <select
                value={selectedSKU}
                onChange={(e) => setSelectedSKU(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm font-semibold rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.sku_id} value={p.sku_id}>
                    {p.sku_id} - {p.product_name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Forecast Horizon
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                {[7, 14, 30].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDays(h)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      days === h
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {h} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {forecastData && (
            <div className="flex items-center gap-3">
              <RiskBadge level={forecastData.risk_level} />
              <Link
                href="/recommendations"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Reorder {forecastData.recommended_order_quantity} Units
              </Link>
            </div>
          )}
        </div>

        {/* Model Accuracy & Metrics Cards */}
        {forecastData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Model Engine</span>
              <div className="text-lg font-bold text-indigo-400 mt-1 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                XGBoost Regressor
              </div>
              <p className="text-xs text-slate-400 mt-1">Lag & Rolling Stats</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mean Abs Error (MAE)</span>
              <div className="text-2xl font-bold text-white mt-1">{forecastData.mae} units</div>
              <p className="text-xs text-slate-400 mt-1">Average daily error magnitude</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Root Mean Sq Error (RMSE)</span>
              <div className="text-2xl font-bold text-white mt-1">{forecastData.rmse} units</div>
              <p className="text-xs text-slate-400 mt-1">Penalty for large outliers</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">MAPE Accuracy</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{forecastData.mape}%</div>
              <p className="text-xs text-slate-400 mt-1">Percentage error rate</p>
            </div>
          </div>
        )}

        {/* Main Forecast Visualizer */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {forecastData?.product_name} ({forecastData?.sku_id}) – {days}-Day Demand Forecast
              </h3>
              <p className="text-xs text-slate-400">
                Historical actual sales vs ML projected daily demand with 95% confidence lower and upper bounds
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Historical Sales
              </span>
              <span className="flex items-center gap-1 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span> Predicted Demand
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-500 text-sm">Running ML Forecast Model...</div>
          ) : (
            forecastData && <ForecastChart data={forecastData.forecast} />
          )}
        </div>
      </div>
    </div>
  );
}
