'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/analytics/StatCard';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import {
  ReferrerList,
  DeviceBreakdown,
  BrowserBreakdown,
} from '@/components/analytics/Breakdowns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { analyticsApi } from '@/lib/api/analytics.api';
import { formatDate } from '@/lib/utils';
import { TimeRange } from '@linkforge/shared';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  MousePointerClick,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function LinkAnalyticsPage() {
  const params = useParams();
  const linkId = params.id as string;
  const { toast } = useToast();
  const [range, setRange] = useState<TimeRange>('7d');
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', linkId, range],
    queryFn: () => analyticsApi.getLinkAnalytics(linkId, range),
    enabled: !!linkId,
  });

  const handleCopy = async () => {
    if (!data?.link) return;
    const url = data.link.shortUrl || `${window.location.origin}/${data.link.shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const isExpired = data?.link?.expiresAt
    ? new Date(data.link.expiresAt).getTime() <= Date.now()
    : false;
  const status = isExpired ? 'expired' : data?.link?.status || 'active';

  return (
    <DashboardShell>
      <TopBar
        title="Link Analytics"
        actions={
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-gray-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Links
            </Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Link Header Card */}
        {isLoading ? (
          <div className="bg-white p-6 rounded-md border border-gray-200 space-y-3">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : (
          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-extrabold text-gray-900 font-mono">
                  {data?.link?.shortCode}
                </span>
                <Badge status={status} />
                {data?.link?.title && (
                  <span className="text-xs text-gray-500 font-medium">&bull; {data.link.title}</span>
                )}
              </div>

              <p className="text-xs text-gray-500 truncate max-w-2xl font-mono">
                &rarr; {data?.link?.originalUrl}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                <span>Created {formatDate(data?.link?.createdAt)}</span>
                {data?.link?.expiresAt && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    Expires {formatDate(data?.link?.expiresAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied' : 'Copy Short Link'}
              </Button>
              {data?.link?.shortUrl && (
                <a href={data.link.shortUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Time range selector & Stat cards */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Time Range:</span>
            <div className="flex rounded-sm bg-white p-0.5 border border-gray-200 shadow-xs text-xs">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-sm uppercase font-semibold transition-colors ${
                    range === r
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard
            label="Total Recorded Clicks"
            value={data?.totalClicks?.toLocaleString() ?? 0}
            icon={<MousePointerClick className="w-5 h-5" />}
          />
          <StatCard
            label="Clicks Today"
            value={data?.todayClicks?.toLocaleString() ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Clicks Over Time Chart Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Clicks Over Time</h3>
              <p className="text-xs text-gray-500 mt-0.5">Click velocity for the selected time window</p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-64 w-full bg-gray-50 animate-pulse rounded-md mt-4" />
          ) : (
            <ClicksChart data={data?.timeSeries || []} />
          )}
        </Card>

        {/* Breakdown Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReferrerList items={data?.referrers || []} />
          <DeviceBreakdown items={data?.devices || []} />
          <BrowserBreakdown items={data?.browsers || []} />
        </div>
      </div>
    </DashboardShell>
  );
}
