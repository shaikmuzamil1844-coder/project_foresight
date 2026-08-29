'use client';
import React, { useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) setFile(f);
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try { await api.seedDatabase(); setSeedDone(true); }
    catch (err) { console.error(err); } finally { setSeeding(false); }
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Data Management" subtitle="Upload historical sales data to retrain the forecasting model" />
      <div style={{ padding: '24px 28px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? '#6366F1' : file ? '#10B981' : '#CBD5E1'}`,
              borderRadius: 16, padding: '48px 32px',
              textAlign: 'center', background: dragging ? '#EEF2FF' : file ? '#F0FDF4' : '#FAFBFC',
              transition: 'all 0.2s ease', cursor: 'pointer',
              marginBottom: 20,
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input id="file-input" type="file" accept=".csv,.xlsx" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
            <div style={{ width: 56, height: 56, borderRadius: 14, background: file ? '#D1FAE5' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {file ? <CheckCircle size={28} color="#10B981" /> : <UploadCloud size={28} color="#6366F1" />}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              {file ? file.name : 'Drag & Drop your dataset here'}
            </h3>
            <p style={{ fontSize: 13.5, color: '#94A3B8', marginBottom: 4 }}>
              {file ? `${(file.size / 1024).toFixed(0)} KB · Ready to import` : 'Supports CSV and XLSX formats'}
            </p>
            {!file && <p style={{ fontSize: 12, color: '#CBD5E1' }}>or click to browse files</p>}
          </div>

          {/* Validation Info */}
          {file && (
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>📊 Dataset Preview</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ValidationRow icon="✓" label="Format" value="CSV / XLSX" ok />
                <ValidationRow icon="✓" label="File" value={file.name} ok />
                <ValidationRow icon="✓" label="Size" value={`${(file.size / 1024).toFixed(1)} KB`} ok />
                <ValidationRow icon="○" label="Records detected" value="Processing..." />
              </div>
            </div>
          )}

          {/* Seed Demo Data */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={18} color="#64748B" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Use Sample Dataset</div>
                <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 14 }}>
                  Load 3,660 retail transactions across 10 SKUs to explore all platform features immediately.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {seedDone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle size={16} /> Sample data loaded successfully!
                    </div>
                  ) : (
                    <button onClick={handleSeed} disabled={seeding} className="btn-primary" style={{ opacity: seeding ? 0.7 : 1 }}>
                      {seeding ? 'Loading...' : 'Load Sample Dataset'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Format Guide */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Expected CSV Format</div>
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px', border: '1px solid #E2E8F0', fontFamily: 'monospace', fontSize: 12, color: '#334155', lineHeight: 1.7 }}>
              date, sku_id, product_name, category, units_sold, revenue, stock_level<br />
              2025-01-01, SKU001, Wireless Mouse, Electronics, 43, 34357, 120<br />
              ...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ValidationRow = ({ icon, label, value, ok }: { icon: string; label: string; value: string; ok?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: ok ? '#10B981' : '#94A3B8' }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color: ok ? '#059669' : '#94A3B8' }}>{value}</span>
  </div>
);
