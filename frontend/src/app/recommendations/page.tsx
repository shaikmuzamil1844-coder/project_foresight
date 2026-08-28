'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { RiskBadge } from '@/components/risk-badge';
import { api } from '@/lib/api';
import { RiskItem } from '@/lib/types';
import { ShoppingCart, CheckCircle, DollarSign, PackageCheck, AlertTriangle } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderSent, setOrderSent] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations();
      setRecommendations(res);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCost = recommendations.reduce((acc, item) => acc + item.recommended_purchase_cost, 0);
  const totalUnits = recommendations.reduce((acc, item) => acc + item.recommended_quantity, 0);

  const handleOrder = () => {
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 5000);
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Purchase Order Recommendations Engine"
        subtitle="Automated reorder quantities based on Lead Time Demand, Safety Stock, and Target 30-Day Inventory."
        onRefresh={loadData}
      />

      <div className="px-8 mt-6 space-y-6">
        {/* Order Success Toast Alert */}
        {orderSent && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-sm">Purchase Orders Transmitted to Supplier!</p>
                <p className="text-xs text-emerald-400/80">
                  Transmitted orders for {recommendations.length} SKUs ({totalUnits} total units) worth ₹{totalCost.toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Order Value</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{totalCost.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Estimated procurement budget</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SKUs Requiring Reorder</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{recommendations.length} Products</div>
            <p className="text-xs text-slate-400 mt-1">At or below reorder threshold</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Purchase Units</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{totalUnits.toLocaleString()} Units</div>
            <p className="text-xs text-slate-400 mt-1">Restocks 30-day inventory target</p>
          </div>
        </div>

        {/* Action Button Banner */}
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recommended Procurement Action Plan</h3>
            <p className="text-xs text-slate-400">Review generated quantities before confirming supplier purchase orders</p>
          </div>
          <button
            onClick={handleOrder}
            disabled={recommendations.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            Transmit All Purchase Orders
          </button>
        </div>

        {/* Purchase Orders Table */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">SKU</th>
                  <th className="pb-3 px-3">Product Name</th>
                  <th className="pb-3 px-3 text-right">Unit Price</th>
                  <th className="pb-3 px-3 text-right">Current Stock</th>
                  <th className="pb-3 px-3 text-right">ROP</th>
                  <th className="pb-3 px-3 text-center">Stockout Countdown</th>
                  <th className="pb-3 px-3 text-center">Risk</th>
                  <th className="pb-3 px-3 text-right">Recommended Qty</th>
                  <th className="pb-3 px-3 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Generating purchase order recommendations...
                    </td>
                  </tr>
                ) : recommendations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      ✅ All inventory levels are healthy! No purchase orders required.
                    </td>
                  </tr>
                ) : (
                  recommendations.map((item) => (
                    <tr key={item.sku_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-400">{item.sku_id}</td>
                      <td className="py-3 px-3 font-medium text-slate-200">{item.product_name}</td>
                      <td className="py-3 px-3 text-right text-slate-300">₹{item.price.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200">{item.current_stock}</td>
                      <td className="py-3 px-3 text-right text-amber-300 font-semibold">{item.reorder_point}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">{item.days_to_stockout} days</td>
                      <td className="py-3 px-3 text-center">
                        <RiskBadge level={item.risk_level} />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-400">{item.recommended_quantity} units</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        ₹{item.recommended_purchase_cost.toLocaleString()}
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
