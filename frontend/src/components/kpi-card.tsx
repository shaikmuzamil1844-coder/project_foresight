import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'blue';
}

const colorMap = {
  indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
  rose: 'from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20',
  amber: 'from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20',
  emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  blue: 'from-blue-500/10 to-blue-600/5 text-blue-400 border-blue-500/20',
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
