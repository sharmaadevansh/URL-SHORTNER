import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-5 flex items-center justify-between', className)}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {change && <p className="text-[11px] font-medium text-green-600">{change}</p>}
      </div>
      {icon && <div className="p-3 bg-brand-50 rounded-md text-brand-600">{icon}</div>}
    </Card>
  );
}
