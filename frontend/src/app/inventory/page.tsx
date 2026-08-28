'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { RiskItem } from '@/lib/types';
import { ShieldCheck, Info, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [matrix, setMatrix] = useState<RiskItem[]>([]);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getRiskMatrix();
      setMatrix(res);
    } catch (err) {
      console.error('Failed to load risk matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMatrix = matrix.filter((item) => {
    const matchesRisk = filterRisk === 'ALL' || item.risk_level === filterRisk;
    const matchesSearch =
      item.sku_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Inventory Risk & Intelligence Matrix"
        subtitle="Calculates Safety Stock (95% service level) and Reorder Points (ROP) across all SKUs."
        onRefresh={loadData}
      />

      <div className="px-8 mt-6 space-y-6">
        {/* Supply Chain Mechanics Info Banner */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-indigo-200">
            <p className="font-bold text-sm text-indigo-300">Supply Chain Risk Scoring Formulas:</p>
            <p className="mt-1">
              • <strong className="text-white">Lead Time Demand (LTD)</strong> = Avg Daily Demand × Lead Time Days |{' '}
              <strong className="text-white">Safety Stock (SS)</strong> = 1.65 × Demand StdDev × &radic;(Lead Time) |{' '}
              <strong className="text-white">Reorder Point (ROP)</strong> = LTD + SS.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, Product, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Risk Filter:</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'OVERSTOCK'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterRisk === r
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full Risk Matrix Table */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">SKU</th>
                  <th className="pb-3 px-3">Product Name</th>
                  <th className="pb-3 px-3 text-right">Current Stock</th>
                  <th className="pb-3 px-3 text-right">Daily Demand</th>
                  <th className="pb-3 px-3 text-right">Lead Time</th>
                  <th className="pb-3 px-3 text-right">Lead Time Demand</th>
                  <th className="pb-3 px-3 text-right">Safety Stock</th>
                  <th className="pb-3 px-3 text-right">Reorder Point (ROP)</th>
                  <th className="pb-3 px-3 text-center">Stockout In</th>
                  <th className="pb-3 px-3 text-center">Risk Level</th>
                  <th className="pb-3 px-3 text-right">Reorder Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500">
                      Calculating inventory risks...
                    </td>
                  </tr>
                ) : filteredMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredMatrix.map((item) => (
                    <tr key={item.sku_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-400">{item.sku_id}</td>
                      <td className="py-3 px-3 font-medium text-slate-200">{item.product_name}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">{item.current_stock}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{item.avg_daily_demand}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{item.lead_time_days} days</td>
                      <td className="py-3 px-3 text-right text-slate-300">{item.lead_time_demand}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{item.safety_stock}</td>
                      <td className="py-3 px-3 text-right font-semibold text-amber-300">{item.reorder_point}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">{item.days_to_stockout} days</td>
                      <td className="py-3 px-3 text-center">
                        <RiskBadge level={item.risk_level} />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        {item.recommended_quantity > 0 ? `${item.recommended_quantity} units` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
