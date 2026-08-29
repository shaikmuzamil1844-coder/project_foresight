import React from 'react';

interface RiskBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'OVERSTOCK';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const map: Record<string, string> = {
    HIGH: 'badge-critical',
    MEDIUM: 'badge-warning',
    LOW: 'badge-success',
    OVERSTOCK: 'badge-overstock',
  };
  const labels: Record<string, string> = {
    HIGH: '🔴 Critical',
    MEDIUM: '🟠 Warning',
    LOW: '🟢 Healthy',
    OVERSTOCK: '🔵 Overstock',
  };
  return <span className={map[level] ?? 'badge-success'}>{labels[level] ?? level}</span>;
};
