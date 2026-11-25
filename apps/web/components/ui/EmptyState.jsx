import React from 'react';
import { Button } from './Button';
export function EmptyState({ icon, title, description, actionLabel, onAction }) {
    return (<div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-md bg-white">
      {icon && <div className="mb-4 text-gray-400 p-3 bg-gray-50 rounded-full">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (<Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>)}
    </div>);
}
