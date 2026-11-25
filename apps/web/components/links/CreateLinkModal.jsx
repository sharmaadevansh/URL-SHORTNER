'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLinkSchema } from '@linkforge/shared';
import { linksApi } from '../../lib/api/links.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react';

export function CreateLinkModal({ isOpen, onClose, onCreated, initialUrl = '' }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hostPrefix = typeof window !== 'undefined' ? `${window.location.host}/` : 'linkforge/';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: initialUrl,
      title: '',
      customAlias: '',
      expiresAt: '',
    },
  });

  useEffect(() => {
    if (isOpen && initialUrl) {
      reset({
        originalUrl: initialUrl,
        title: '',
        customAlias: '',
        expiresAt: '',
      });
    }
  }, [isOpen, initialUrl, reset]);

  const handleClose = () => {
    reset({
      originalUrl: '',
      title: '',
      customAlias: '',
      expiresAt: '',
    });
    setCreatedLink(null);
    setShowAdvanced(false);
    setCopied(false);
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = {
        originalUrl: data.originalUrl,
        title: data.title?.trim() || undefined,
        customAlias: data.customAlias?.trim() || undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };
      const result = await linksApi.createLink(payload);
      setCreatedLink(result);
      onCreated(result);
      toast.success('Link created successfully!');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create link. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatedUrl = createdLink
    ? createdLink.shortUrl ||
      `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdLink.shortCode}`
    : '';

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdLink ? 'Link created!' : 'Create new link'}
      description={
        createdLink
          ? 'Your short link is live and ready to share.'
          : 'Turn a long URL into an optimized short link.'
      }
      maxWidth="md"
    >
      {createdLink ? (
        <div className="space-y-6 pt-2">
          <div className="bg-brand-50/60 border border-brand-100 rounded-md p-4 text-center">
            <span className="text-xs text-brand-600 font-semibold tracking-wide uppercase">
              Your Short Link
            </span>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center justify-center gap-1.5 text-lg font-bold text-gray-900 hover:text-brand-600 font-mono break-all"
            >
              <span>{generatedUrl}</span>
              <ExternalLink className="w-4 h-4 shrink-0 text-brand-500" />
            </a>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCopy} className="flex-1">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Link'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const targetId = createdLink.id;
                handleClose();
                router.push(`/dashboard/links/${targetId}/analytics`);
              }}
            >
              View Analytics &rarr;
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                reset({ originalUrl: '', title: '', customAlias: '', expiresAt: '' });
                setCreatedLink(null);
                setCopied(false);
              }}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              + Create another link
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Destination URL *"
            placeholder="https://example.com/long/article-path"
            error={errors.originalUrl?.message}
            {...register('originalUrl')}
          />

          <Input
            label="Link title (optional)"
            placeholder="e.g. My Portfolio Launch"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Advanced toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 bg-gray-50 rounded-md border border-gray-100 space-y-3.5 animate-slide-down">
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Custom alias (optional)
                  </label>
                  <div className="flex items-center rounded-sm border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                    <span className="px-3 py-2 bg-gray-50 text-gray-500 text-xs border-r border-gray-200 select-none max-w-[160px] truncate">
                      {hostPrefix}
                    </span>
                    <input
                      type="text"
                      placeholder="custom-name"
                      className="px-3 py-2 text-xs flex-1 outline-none text-gray-900"
                      {...register('customAlias')}
                    />
                  </div>
                  {errors.customAlias && (
                    <p className="mt-1 text-xs text-red-600">{errors.customAlias.message}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    3-50 characters. Letters, numbers, hyphens, and underscores only.
                  </p>
                </div>

                <div>
                  <Input
                    type="date"
                    label="Expiration Date (optional)"
                    error={errors.expiresAt?.message}
                    helperText="Link will stop redirecting after this date."
                    {...register('expiresAt')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Link &rarr;
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
