'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TimeSeriesPoint } from '@linkforge/shared';

interface ClicksChartProps {
  data: TimeSeriesPoint[];
}

export function ClicksChart({ data }: ClicksChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-gray-50 animate-pulse rounded-md" />;
  }

  const formattedData = data.map((d) => {
    const date = new Date(d.date);
    const label = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`;
    return {
      name: label,
      clicks: d.clicks,
    };
  });

  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);

  if (totalClicks === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-md bg-gray-50/50 text-center p-6">
        <p className="text-sm font-semibold text-gray-700">No clicks recorded in this period</p>
        <p className="text-xs text-gray-400 mt-1">Share your link to start generating clicks.</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="clickColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              padding: '8px 12px',
            }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#4f6ef7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#clickColor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
