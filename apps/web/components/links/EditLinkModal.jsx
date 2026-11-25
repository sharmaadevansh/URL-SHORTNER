'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateLinkSchema } from '@linkforge/shared';
import { linksApi } from '../../lib/api/links.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function EditLinkModal({ isOpen, onClose, link, onUpdated }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('active');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateLinkSchema),
  });

  useEffect(() => {
    if (link) {
      reset({
        title: link.title || '',
        originalUrl: link.originalUrl,
        expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : '',
      });
      setStatus(link.status);
    }
  }, [link, reset]);

  if (!link) return null;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: data.title?.trim() || undefined,
        originalUrl: data.originalUrl,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      const updated = await linksApi.updateLink(link.id, payload);
      if (status !== link.status) {
        await linksApi.updateStatus(link.id, { status });
        updated.status = status;
      }
      onUpdated(updated);
      toast.success('Link updated successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update link';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit link" description={`/${link.shortCode}`} maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Destination URL *"
          error={errors.originalUrl?.message}
          {...register('originalUrl')}
        />

        <Input
          label="Link title (optional)"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          type="date"
          label="Expiration Date"
          error={errors.expiresAt?.message}
          {...register('expiresAt')}
        />

        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-800 mb-1">Link Status</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm border ${
                status === 'active'
                  ? 'bg-green-50 text-green-700 border-green-300 ring-2 ring-green-200'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('disabled')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm border ${
                status === 'disabled'
                  ? 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-gray-200'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Disabled
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
