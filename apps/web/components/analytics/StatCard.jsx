import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
export function StatCard({ label, value, change, icon, className }) {
    return (<Card className={cn('p-5 flex items-center justify-between', className)}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {change && <p className="text-[11px] font-medium text-green-600">{change}</p>}
      </div>
      {icon && <div className="p-3 bg-brand-50 rounded-md text-brand-600">{icon}</div>}
    </Card>);
}
