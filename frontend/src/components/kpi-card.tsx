import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'blue';
}

const colorMap: Record<string, { iconBg: string; iconColor: string }> = {
  indigo:  { iconBg: '#E0E7FF', iconColor: '#4F46E5' },
  emerald: { iconBg: '#D1FAE5', iconColor: '#059669' },
  rose:    { iconBg: '#FFE4E6', iconColor: '#E11D48' },
  amber:   { iconBg: '#FEF3C7', iconColor: '#D97706' },
  violet:  { iconBg: '#EDE9FE', iconColor: '#7C3AED' },
  blue:    { iconBg: '#DBEAFE', iconColor: '#2563EB' },
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, trend, icon: Icon, color }) => {
  const c = colorMap[color] ?? colorMap.indigo;
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="card card-hover" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={c.iconColor} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700,
            color: isPositive ? '#059669' : '#E11D48',
            background: isPositive ? '#F0FDF4' : '#FFF1F2',
            border: `1px solid ${isPositive ? '#A7F3D0' : '#FFE4E6'}`,
            padding: '2px 8px', borderRadius: 999,
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginTop: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
};
