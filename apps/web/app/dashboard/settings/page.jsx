'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, changePasswordSchema } from '@linkforge/shared';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import { User, Lock, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { toast } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPasswordValue = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = async (data) => {
    try {
      setIsUpdatingProfile(true);
      const updated = await authApi.updateProfile(data);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setIsUpdatingPassword(true);
      await authApi.changePassword(data);
      resetPassword({ currentPassword: '', newPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    try {
      setIsDeletingAccount(true);
      await authApi.deleteAccount();
      logout();
      toast.success('Your account has been deleted');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  return (
    <DashboardShell>
      <TopBar title="Account Settings" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <User className="w-5 h-5 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-500">Update your account name and email address</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4 max-w-lg">
              <Input
                label="Full Name"
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />

              <Input
                type="email"
                label="Email Address"
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />

              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Lock className="w-5 h-5 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Security &amp; Password</h3>
                <p className="text-xs text-gray-500">
                  Ensure your account uses a strong, random password
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-lg">
              <Input
                type="password"
                label="Current Password"
                placeholder="••••••••••••"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />

              <div>
                <Input
                  type="password"
                  label="New Password"
                  placeholder="••••••••••••"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword')}
                />
                <PasswordStrength password={newPasswordValue} />
              </div>

              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingPassword}>
                Update Password
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 bg-red-50/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 max-w-xl">
              Deleting your account will permanently remove all your links, short codes, and
              analytics records. This action cannot be reversed.
            </p>

            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteConfirmation('');
                setIsDeleteModalOpen(true);
              }}
            >
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-gray-600 leading-relaxed">
            This action is permanent. All your shortened links will immediately stop resolving.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Type <span className="font-mono text-red-600 font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-sm font-mono outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              disabled={deleteConfirmation !== 'DELETE'}
              isLoading={isDeletingAccount}
              onClick={onDeleteAccount}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
