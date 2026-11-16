'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/authStore';
import { authApi } from '../../lib/api/auth.api';
import { Sidebar } from './Sidebar';
import { Spinner } from '../ui/Spinner';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, accessToken, setUser, setLoading, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function verifyAuth() {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      } catch {
        // If expired or unauthorized, client interceptor will attempt refresh
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [router, setUser, setLoading]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated && !accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100/60 text-gray-900 pb-16 md:pb-0">
      <Sidebar />
      <div className="md:pl-60 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
