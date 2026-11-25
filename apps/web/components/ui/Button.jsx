import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';
export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-xs border border-transparent',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 border border-transparent',
        outline: 'bg-white border border-gray-300 text-gray-800 hover:border-brand-500 hover:text-brand-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs border border-transparent',
        link: 'text-brand-500 underline-offset-4 hover:underline p-0 h-auto bg-transparent border-none',
    };
    const sizes = {
        sm: 'py-1 px-3 text-sm rounded-sm',
        md: 'py-2 px-4 text-sm font-medium rounded-md',
        lg: 'py-2.5 px-6 text-base font-medium rounded-md',
    };
    return (<button ref={ref} disabled={disabled || isLoading} className={cn('inline-flex items-center justify-center transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none', variants[variant], variant !== 'link' && sizes[size], className)} {...props}>
        {isLoading && <Spinner size="sm" className="mr-2 text-current"/>}
        {children}
      </button>);
});
Button.displayName = 'Button';
