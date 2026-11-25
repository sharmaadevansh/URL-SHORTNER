'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../lib/store/authStore';
import {
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight,
  Database,
  Server,
  Layers,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [url, setUrl] = useState('');

  const handleHeroShorten = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (isAuthenticated) {
      router.push(`/dashboard?prefill=${encodeURIComponent(url.trim())}`);
    } else {
      router.push(`/register?prefill=${encodeURIComponent(url.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-28 bg-gradient-to-b from-brand-50/40 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight">
            Shorten links. <br className="hidden sm:inline" />
            <span className="text-brand-500">Track every click.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Create short links with custom aliases, expiration dates, and click analytics.
          </p>

          <form
            onSubmit={handleHeroShorten}
            className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-md border border-gray-200 shadow-md"
          >
            <input
              type="url"
              required
              placeholder="Paste your long URL (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none rounded-sm"
            />
            <Button type="submit" variant="primary" size="lg" className="shrink-0 gap-1.5">
              Shorten URL
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Features</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-white rounded-md border border-gray-200 shadow-xs">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Fast 302 Redirects</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Base62 short codes cached in memory with TTL clamping for low-latency lookups.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-md border border-gray-200 shadow-xs">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Click Analytics</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Async click tracking across time series, referrers, devices, and browsers.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-md border border-gray-200 shadow-xs">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Custom Aliases &amp; Expiry</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create branded aliases, toggle link status, and enforce expiration with HTTP 410.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-md border border-gray-200 shadow-xs">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Security &amp; Validation</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Zod schema validation blocks unsafe protocols, backed by JWT auth and rate limiting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="architecture" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tech Stack</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Next.js &amp; Tailwind</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                React 18, Next.js 14 App Router, React Query, Zustand, and Recharts on Vercel.
              </p>
            </div>

            <div className="p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Node.js &amp; Express</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Modular REST API with Zod schemas, Pino logging, and rate limiting on Render.
              </p>
            </div>

            <div className="p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">MongoDB &amp; Cache</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                MongoDB Atlas with Mongoose indexes and TTL-bounded in-memory redirect caching.
              </p>
            </div>

            <div className="p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">JWT &amp; Security</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Access/refresh JWT tokens, HttpOnly cookies, bcrypt hashing, and Helmet headers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
