'use client';

import React from 'react';
import { useAuthStore } from '../../lib/store/authStore';

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title ? (
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        ) : (
          <span className="text-xs font-medium text-gray-500">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}
