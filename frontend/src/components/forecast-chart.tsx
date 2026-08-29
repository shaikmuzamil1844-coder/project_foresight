'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ForecastItem } from '@/lib/types';

interface ForecastChartProps { data: ForecastItem[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(15,23,42,0.08)', minWidth: 160 }}>
        <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>{label}</p>
        {payload.map((p: any) => p.value != null && (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: p.color }}>{p.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{typeof p.value === 'number' ? p.value.toFixed(0) : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const fmt = data.map((d) => ({
    ...d, date: d.date.slice(5),
    confidence_band: [d.lower_bound, d.upper_bound],
  }));
  const splitIdx = fmt.findIndex((d) => d.actual_demand == null);
  const splitDate = splitIdx >= 0 ? fmt[splitIdx]?.date : null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={fmt} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {/* Confidence band */}
        <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#EEF2FF" fillOpacity={0.8} name="Upper Bound" dot={false} />
        <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#FFFFFF" fillOpacity={1} name="Lower Bound" dot={false} />
        {/* Actual */}
        <Line type="monotone" dataKey="actual_demand" stroke="#6366F1" strokeWidth={2.5} dot={false} name="Historical" connectNulls={false} />
        {/* Forecast */}
        <Line type="monotone" dataKey="predicted_demand" stroke="#7C3AED" strokeWidth={2} strokeDasharray="5 3" dot={false} name="AI Forecast" />
        {splitDate && <ReferenceLine x={splitDate} stroke="#E2E8F0" strokeDasharray="4 2" label={{ value: 'Forecast', position: 'top', fontSize: 10, fill: '#94A3B8' }} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
