'use client';
import React, { useState } from 'react';
import { linksApi } from '../../lib/api/links.api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { AlertTriangle } from 'lucide-react';
export function DeleteConfirmModal({ isOpen, onClose, link, onDeleted }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    if (!link)
        return null;
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await linksApi.deleteLink(link.id);
            onDeleted(link.id);
            toast.success('Link deleted successfully');
            onClose();
        }
        catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to delete link');
        }
        finally {
            setIsDeleting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center pt-2">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6"/>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Short Link?</h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-gray-800 font-mono">{link.shortCode}</span>?
          Visitors trying to open this link will receive a 404 error. This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>);
}
