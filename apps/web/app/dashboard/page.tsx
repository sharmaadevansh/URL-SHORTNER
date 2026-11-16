'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/analytics/StatCard';
import { LinkCard } from '@/components/links/LinkCard';
import { CreateLinkModal } from '@/components/links/CreateLinkModal';
import { EditLinkModal } from '@/components/links/EditLinkModal';
import { DeleteConfirmModal } from '@/components/links/DeleteConfirmModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { linksApi } from '@/lib/api/links.api';
import { analyticsApi } from '@/lib/api/analytics.api';
import { Link as LinkType } from '@linkforge/shared';
import { Link2, MousePointerClick, Zap, Search, Plus } from 'lucide-react';

function DashboardContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const prefillUrl = searchParams.get('prefill');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'expired'>('all');
  const [page, setPage] = useState(1);

  // Open create modal if URL prefilled from landing page
  useEffect(() => {
    if (prefillUrl) {
      setIsCreateOpen(true);
    }
  }, [prefillUrl]);

  // Query account overview stats
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  // Query links list
  const { data: linksData, isLoading } = useQuery({
    queryKey: ['links', { page, status: statusFilter, search }],
    queryFn: () =>
      linksApi.getLinks({
        page,
        limit: 10,
        status: statusFilter,
        search: search.trim() || undefined,
      }),
  });

  const handleLinkCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['links'] });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
  };

  const handleLinkUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['links'] });
  };

  const handleLinkDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['links'] });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
  };

  return (
    <DashboardShell>
      <TopBar
        title="Links Dashboard"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Link
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Total Links"
            value={overview?.totalLinks ?? '...'}
            icon={<Link2 className="w-5 h-5" />}
          />
          <StatCard
            label="Total Clicks"
            value={overview?.totalClicks?.toLocaleString() ?? '...'}
            icon={<MousePointerClick className="w-5 h-5" />}
          />
          <StatCard
            label="Active Links"
            value={overview?.activeLinks ?? '...'}
            icon={<Zap className="w-5 h-5" />}
          />
        </div>

        {/* Search, Filter, and Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-md border border-gray-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search links by title, code, or destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <div className="flex rounded-sm bg-gray-100 p-0.5 border border-gray-200 text-xs font-medium">
              {(['all', 'active', 'disabled', 'expired'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-sm capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links List Section */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-md border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : linksData && linksData.items.length > 0 ? (
            <>
              <div className="space-y-3">
                {linksData.items.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onEdit={(l) => setEditingLink(l)}
                    onDelete={(l) => setDeletingLink(l)}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {linksData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>
                    Showing {(page - 1) * 10 + 1} &ndash;{' '}
                    {Math.min(page * 10, linksData.total)} of {linksData.total} links
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    >
                      &larr; Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= linksData.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next &rarr;
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Link2 className="w-8 h-8" />}
              title="No links found"
              description={
                search || statusFilter !== 'all'
                  ? 'No links match your search or filter criteria.'
                  : 'You have not created any short links yet. Get started by shortening your first URL.'
              }
              actionLabel="+ Create your first link"
              onAction={() => setIsCreateOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleLinkCreated}
        initialUrl={prefillUrl || ''}
      />

      <EditLinkModal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        link={editingLink}
        onUpdated={handleLinkUpdated}
      />

      <DeleteConfirmModal
        isOpen={!!deletingLink}
        onClose={() => setDeletingLink(null)}
        link={deletingLink}
        onDeleted={handleLinkDeleted}
      />
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
