'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { KPICard } from '@/components/kpi-card';
import { SalesChart } from '@/components/sales-chart';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { DashboardSummary, SalesTrendItem, RiskItem } from '@/lib/types';
import { Boxes, DollarSign, AlertTriangle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([]);
  const [riskMatrix, setRiskMatrix] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, riskRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getSalesTrend(),
        api.getRiskMatrix(),
      ]);
      setSummary(sumRes);
      setSalesTrend(trendRes);
      setRiskMatrix(riskRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Executive Intelligence Dashboard"
        subtitle="Real-time demand forecasting and supply chain stockout risk monitor."
        onRefresh={loadData}
      />

      <div className="px-8 mt-6 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            title="Total Active SKUs"
            value={summary?.total_skus ?? 0}
            subtitle={`${summary?.total_inventory.toLocaleString() ?? 0} total units in stock`}
            icon={Boxes}
            color="indigo"
          />
          <KPICard
            title="30-Day Revenue"
            value={`₹${(summary?.total_revenue_30d ?? 0).toLocaleString()}`}
            subtitle={`${(summary?.total_sales_volume_30d ?? 0).toLocaleString()} units sold`}
            icon={DollarSign}
            color="emerald"
          />
          <KPICard
            title="Stockout Risk SKUs"
            value={summary?.high_risk_skus_count ?? 0}
            subtitle={`${summary?.medium_risk_skus_count ?? 0} warning risks`}
            icon={AlertTriangle}
            color="rose"
          />
          <KPICard
            title="Reorder Investment"
            value={`₹${(summary?.recommended_purchase_value ?? 0).toLocaleString()}`}
            subtitle="Recommended order value"
            icon={ShoppingBag}
            color="amber"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Sales Trend Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Historical Sales Trajectory</h3>
                <p className="text-xs text-slate-400">Daily aggregate sales volume across all product categories</p>
              </div>
            </div>
            {loading ? (
              <div className="h-72 flex items-center justify-center text-slate-500 text-sm">Loading charts...</div>
            ) : (
              <SalesChart data={salesTrend} />
            )}
          </div>

          {/* Risk Breakdown Summary Panel */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Inventory Risk Breakdown</h3>
              <p className="text-xs text-slate-400 mb-6">SKU status distribution based on Safety Stock & ROP</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs font-semibold text-rose-300">Critical Stockout Risk</span>
                  <span className="text-base font-bold text-rose-400">{summary?.high_risk_skus_count ?? 0} SKUs</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs font-semibold text-amber-300">Warning (Near ROP)</span>
                  <span className="text-base font-bold text-amber-400">{summary?.medium_risk_skus_count ?? 0} SKUs</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-semibold text-emerald-300">Optimal Stock Level</span>
                  <span className="text-base font-bold text-emerald-400">{summary?.low_risk_skus_count ?? 0} SKUs</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-semibold text-blue-300">Overstock / Excess Capital</span>
                  <span className="text-base font-bold text-blue-400">{summary?.overstock_skus_count ?? 0} SKUs</span>
                </div>
              </div>
            </div>

            <Link
              href="/recommendations"
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/20"
            >
              View Purchase Recommendations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Top At-Risk Products Table */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top At-Risk Products</h3>
              <p className="text-xs text-slate-400">Products requiring immediate reordering attention</p>
            </div>
            <Link href="/inventory" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Full Risk Matrix &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">SKU</th>
                  <th className="pb-3 px-3">Product Name</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3 text-right">Current Stock</th>
                  <th className="pb-3 px-3 text-right">Daily Demand</th>
                  <th className="pb-3 px-3 text-right">Reorder Point</th>
                  <th className="pb-3 px-3 text-center">Stockout In</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {riskMatrix.slice(0, 5).map((item) => (
                  <tr key={item.sku_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{item.sku_id}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{item.product_name}</td>
                    <td className="py-3 px-3 text-slate-400">{item.category}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">{item.current_stock}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{item.avg_daily_demand}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{item.reorder_point}</td>
                    <td className="py-3 px-3 text-center font-bold text-rose-400">{item.days_to_stockout} days</td>
                    <td className="py-3 px-3 text-center">
                      <RiskBadge level={item.risk_level} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/forecast?sku=${item.sku_id}`}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold transition-colors"
                      >
                        Forecast
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
