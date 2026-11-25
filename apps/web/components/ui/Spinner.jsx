import React from 'react';
import { cn } from '../../lib/utils';
export function Spinner({ size = 'md', className, ...props }) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };
    return (<div className={cn('animate-spin rounded-full border-solid border-current border-t-transparent', sizeClasses[size], className)} role="status" aria-label="Loading" {...props}/>);
}
