'use client';
import React from 'react';
import { useAuthStore } from '../../lib/store/authStore';

export function TopBar({ title, subtitle, actions }) {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200/80">
        <div>
          {title ? (
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
