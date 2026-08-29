'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Search, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.getProducts().then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p) =>
    (category === 'All' || p.category === category) &&
    (p.product_name.toLowerCase().includes(search.toLowerCase()) || p.sku_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ flex: 1 }}>
      <Header title="Products" subtitle={`${products.length} SKUs in catalogue`} />
      <div style={{ padding: '24px 28px 40px' }}>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 320 }}>
            <Search size={14} color="#94A3B8" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU or product name..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: '#0F172A', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <div className="pill-group">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`pill-btn${category === c ? ' active' : ''}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map((p) => (
              <div key={p.sku_id} className="card card-hover" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="#4F46E5" />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '2px 8px', borderRadius: 6 }}>{p.sku_id}</span>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{p.product_name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>{p.category}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>₹{p.price.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Lead time: {p.lead_time}d</div>
                  </div>
                  <Link href={`/forecast?sku=${p.sku_id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#EEF2FF', borderRadius: 8, color: '#4F46E5', fontWeight: 700, fontSize: 12.5, textDecoration: 'none', border: '1px solid #C7D2FE' }}>
                    <TrendingUp size={12} /> Forecast
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
