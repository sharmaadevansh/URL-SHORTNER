'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { formatRelativeTime, formatDate } from '../../lib/utils';
import { Copy, Check, BarChart2, Edit3, Trash2, ExternalLink, Calendar, MousePointerClick } from 'lucide-react';
export function LinkCard({ link, onEdit, onDelete }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    // Compute status
    const isExpired = link.expiresAt ? new Date(link.expiresAt).getTime() <= Date.now() : false;
    const status = isExpired ? 'expired' : link.status;
    const shortUrl = link.shortUrl || `${window.location.origin}/${link.shortCode}`;
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            toast.error('Failed to copy link');
        }
    };
    return (<div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Link Info */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <a href={shortUrl} target="_blank" rel="noreferrer" className="font-bold text-base text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1.5">
            {shortUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="w-3.5 h-3.5 text-gray-400"/>
          </a>
          <Badge status={status}/>
          {link.title && (<span className="text-xs text-gray-500 font-medium truncate max-w-xs">
              &bull; {link.title}
            </span>)}
        </div>

        <p className="text-xs text-gray-500 truncate max-w-xl font-mono" title={link.originalUrl}>
          &rarr; {link.originalUrl}
        </p>

        <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
          <span>Created {formatRelativeTime(link.createdAt)}</span>
          {link.expiresAt && (<span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3"/>
              Expires {formatDate(link.expiresAt)}
            </span>)}
        </div>
      </div>

      {/* Clicks & Action Buttons */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-sm border border-gray-100 text-xs font-semibold text-gray-700">
          <MousePointerClick className="w-3.5 h-3.5 text-brand-500"/>
          <span>{link.totalClicks?.toLocaleString() || 0}</span>
          <span className="text-gray-400 font-normal text-[11px]">clicks</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy link" className={copied ? 'text-green-600' : 'text-gray-600'}>
            {copied ? <Check className="w-4 h-4 mr-1 text-green-600"/> : <Copy className="w-4 h-4 mr-1"/>}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Link href={`/dashboard/links/${link.id}/analytics`}>
            <Button variant="ghost" size="sm" title="View analytics">
              <BarChart2 className="w-4 h-4 mr-1"/>
              Stats
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={() => onEdit(link)} title="Edit link">
            <Edit3 className="w-4 h-4"/>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onDelete(link)} title="Delete link" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>);
}
