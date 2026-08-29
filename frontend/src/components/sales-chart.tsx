'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesTrendItem } from '@/lib/types';

interface SalesChartProps { data: SalesTrendItem[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(15,23,42,0.08)' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#4F46E5' }}>{payload[0]?.value?.toLocaleString()} units</p>
        <p style={{ fontSize: 12, color: '#64748B' }}>₹{payload[1]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={6} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="units_sold" stroke="#6366F1" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={1.5} fill="url(#revGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
