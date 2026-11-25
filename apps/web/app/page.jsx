'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../lib/store/authStore';
import {
  Link2,
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Database,
  Server,
  Layers,
  Activity,
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
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-brand-50/50 via-white to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-xs font-semibold text-brand-700 mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Redis-Cached Redirects &amp; Async Click Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight max-w-3xl mx-auto">
            Shorten links. <br className="hidden sm:inline" />
            <span className="text-brand-500">Track every click.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Turn long URLs into clean, trackable links with real-time analytics. Built with a modular
            monolith architecture engineered for low-latency redirects and operational reliability.
          </p>

          {/* Quick Shortener Form */}
          <form
            onSubmit={handleHeroShorten}
            className="mt-8 sm:mt-10 max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-md border border-gray-200 shadow-md"
          >
            <input
              type="url"
              required
              placeholder="Paste your long link here (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none rounded-sm"
            />
            <Button type="submit" variant="primary" size="lg" className="shrink-0 gap-1.5">
              Shorten URL
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2.5">
            Instant Base62 codes, custom aliases, and privacy-first analytics.
          </p>

          {/* Architecture Highlights */}
          <div className="mt-16 grid grid-cols-3 max-w-2xl mx-auto border-t border-b border-gray-100 py-6">
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-gray-900 font-mono">3.5T+</p>
              <p className="text-xs text-gray-500 mt-0.5">Base62 Code Keyspace</p>
            </div>
            <div className="border-x border-gray-100">
              <p className="text-xl sm:text-3xl font-extrabold text-gray-900 font-mono">302</p>
              <p className="text-xs text-gray-500 mt-0.5">Cache-First Redirects</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-gray-900 font-mono">Async</p>
              <p className="text-xs text-gray-500 mt-0.5">Non-Blocking Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 border-y border-gray-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Workflow</h2>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">How LinkForge Works</h3>
            <p className="text-sm text-gray-600 mt-2">
              Three straightforward steps from long URL to real-time click insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-xs relative">
              <span className="text-3xl font-extrabold text-brand-500/20 absolute top-4 right-4 font-mono">
                01
              </span>
              <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4">
                <Link2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Paste your long link</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Input any valid http/https URL. Optionally configure a custom alias or scheduled expiration date.
              </p>
            </div>

            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-xs relative">
              <span className="text-3xl font-extrabold text-brand-500/20 absolute top-4 right-4 font-mono">
                02
              </span>
              <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Get your short link</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Collision-resistant Base62 short codes are persisted in MongoDB and pre-warmed in cache.
              </p>
            </div>

            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-xs relative">
              <span className="text-3xl font-extrabold text-brand-500/20 absolute top-4 right-4 font-mono">
                03
              </span>
              <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Track every click</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click events are processed asynchronously, surfacing referrer, device, browser, and time-series trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              Capabilities
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Built For Engineers &amp; Creators</h3>
            <p className="text-sm text-gray-600 mt-2">
              Every detail engineered for performance, observability, and simplicity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-6 rounded-md border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Cache-Accelerated Redirects</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Active links resolve from Redis (with automatic in-memory fallback) before querying MongoDB, issuing fast HTTP 302 redirects.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-md border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Decoupled Analytics Pipeline</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Click telemetry is dispatched asynchronously via Redis queues or background event loops so analytics never slow down redirects.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-md border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Custom Aliases &amp; Expiration</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Reserve branded slugs, toggle link status on demand, and set expiration dates that cleanly enforce HTTP 410 Gone.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-md border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-md shrink-0 h-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Security &amp; Privacy First</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dangerous schemes like{' '}
                  <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-[11px]">
                    javascript:
                  </code>{' '}
                  are rejected via Zod validation. Raw visitor IPs are never stored, and routes are protected by JWT and rate limiting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview Section */}
      <section id="architecture" className="py-20 bg-gray-50 border-t border-gray-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              System Design
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Production Architecture</h3>
            <p className="text-sm text-gray-600 mt-2">
              Designed as a clean modular monolith with clear boundaries across API, cache, database, and worker layers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Next.js 14 Frontend</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                App Router UI with React Query caching, Zustand auth state, and Recharts click visualizations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Express REST API</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Layered controllers, services, and repositories with Helmet, CORS, rate limiting, and JWT rotation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">MongoDB &amp; Redis</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Indexed Mongoose schemas for durable storage paired with TTL-bounded cache and automatic fallback.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Observability &amp; Ops</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Structured Pino JSON logs, Prometheus <code className="font-mono">/metrics</code>, health probes, and CI/CD pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to shorten your first link?
          </h2>
          <p className="mt-3 text-sm text-gray-400 max-w-lg mx-auto">
            Get started in seconds with our developer-first, high-throughput redirect platform.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-gray-700 text-white hover:bg-gray-900 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
