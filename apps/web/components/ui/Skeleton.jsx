import React from 'react';
import { cn } from '../../lib/utils';
export function Skeleton({ className, ...props }) {
    return (<div className={cn('animate-pulse rounded-sm bg-gray-200/80', className)} {...props}/>);
}
