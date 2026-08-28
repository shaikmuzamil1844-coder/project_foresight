'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { UploadCloud, Database, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await api.uploadCSV(file);
      setStatusMsg({ type: 'success', text: res.message });
      setFile(null);
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to upload CSV file.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await api.seedSampleData();
      setStatusMsg({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to seed sample dataset.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Dataset Ingestion & Seeder Engine"
        subtitle="Upload historical sales and inventory CSV datasets or initialize with sample retail data."
      />

      <div className="px-8 mt-6 space-y-6 max-w-4xl">
        {/* Status Toast Notification */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <p className="text-xs font-semibold">{statusMsg.text}</p>
          </div>
        )}

        {/* 1-Click Sample Dataset Seeder Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instant Demo Dataset Seeder</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Loads 365 days of synthetic transaction history across 10 SKUs (Electronics, Apparel, Accessories, Home).
              </p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            Seed Sample Data
          </button>
        </div>

        {/* File Dropzone Area */}
        <div className="glass-card p-8 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Upload Historical Sales CSV</h3>
            <p className="text-xs text-slate-400 mt-1">Select a CSV file containing date, sku_id, units_sold, price, and lead_time</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors">
              Browse Files
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            {file && <span className="text-xs text-indigo-400 font-mono font-bold">{file.name}</span>}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Ingestion Pipeline
            </button>
          )}
        </div>

        {/* Expected CSV Format Reference Table */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-3">Required CSV Schema Format</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 px-2">date</th>
                  <th className="pb-2 px-2">sku_id</th>
                  <th className="pb-2 px-2">product_name</th>
                  <th className="pb-2 px-2">category</th>
                  <th className="pb-2 px-2">units_sold</th>
                  <th className="pb-2 px-2">price</th>
                  <th className="pb-2 px-2">inventory</th>
                  <th className="pb-2 px-2">supplier_lead_time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-2">2026-01-01</td>
                  <td className="py-2 px-2 text-indigo-400">SKU001</td>
                  <td className="py-2 px-2">Wireless Mouse</td>
                  <td className="py-2 px-2">Accessories</td>
                  <td className="py-2 px-2 text-emerald-400">42</td>
                  <td className="py-2 px-2">799</td>
                  <td className="py-2 px-2">120</td>
                  <td className="py-2 px-2">7</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">2026-01-02</td>
                  <td className="py-2 px-2 text-indigo-400">SKU001</td>
                  <td className="py-2 px-2">Wireless Mouse</td>
                  <td className="py-2 px-2">Accessories</td>
                  <td className="py-2 px-2 text-emerald-400">38</td>
                  <td className="py-2 px-2">799</td>
                  <td className="py-2 px-2">115</td>
                  <td className="py-2 px-2">7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
