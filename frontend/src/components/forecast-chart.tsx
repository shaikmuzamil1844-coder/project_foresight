'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ForecastItem } from '@/lib/types';

interface ForecastChartProps {
  data: ForecastItem[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(str) => {
              const parts = str.split('-');
              return `${parts[1]}/${parts[2]}`;
            }}
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          
          {/* Upper confidence bound area */}
          <Area
            type="monotone"
            dataKey="upper_bound"
            name="95% Upper Bound"
            stroke="none"
            fill="url(#confidenceGradient)"
          />
          
          {/* Historical Demand Line */}
          <Line
            type="monotone"
            dataKey="actual_demand"
            name="Historical Sales"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#6366f1' }}
            connectNulls={false}
          />

          {/* Predicted Demand Line */}
          <Line
            type="monotone"
            dataKey="predicted_demand"
            name="Predicted Forecast"
            stroke="#ec4899"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            dot={{ r: 4, fill: '#ec4899' }}
          />

          {/* Lower confidence bound line */}
          <Line
            type="monotone"
            dataKey="lower_bound"
            name="95% Lower Bound"
            stroke="#a855f7"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
