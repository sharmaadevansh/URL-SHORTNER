import React from 'react';
import { cn } from '../../lib/utils';
export function Badge({ status, className, ...props }) {
    const configs = {
        active: {
            label: 'Active',
            wrapper: 'bg-green-50 text-green-700 border-green-200',
            dot: 'bg-green-500',
        },
        disabled: {
            label: 'Disabled',
            wrapper: 'bg-gray-100 text-gray-600 border-gray-200',
            dot: 'bg-gray-400',
        },
        expired: {
            label: 'Expired',
            wrapper: 'bg-red-50 text-red-600 border-red-200',
            dot: 'bg-red-500',
        },
    };
    const current = configs[status] || configs.active;
    return (<span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', current.wrapper, className)} {...props}>
      <span className={cn('w-1.5 h-1.5 rounded-full', current.dot)}/>
      {current.label}
    </span>);
}
