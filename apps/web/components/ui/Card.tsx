import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-gray-200 bg-white p-6 shadow-xs',
        hoverEffect && 'transition-all duration-150 hover:shadow-sm hover:border-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
