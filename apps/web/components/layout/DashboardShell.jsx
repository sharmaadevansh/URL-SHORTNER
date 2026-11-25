'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/authStore';
import { authApi } from '../../lib/api/auth.api';
import { DashboardNavbar } from './DashboardNavbar';
import { Footer } from './Footer';
import { Spinner } from '../ui/Spinner';

export function DashboardShell({ children }) {
  const router = useRouter();
  const { isAuthenticated, accessToken, setUser, setLoading, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Hydrate cached user info immediately while verifying session
    try {
      const cachedUser = localStorage.getItem('user_info');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
    } catch {}

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
        router.push('/login');
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <DashboardNavbar />
      <main className="flex-1 pb-12">{children}</main>
      <Footer />
    </div>
  );
}
