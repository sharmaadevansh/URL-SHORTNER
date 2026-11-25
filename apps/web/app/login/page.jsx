'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@linkforge/shared';
import { authApi } from '../../lib/api/auth.api';
import { useAuthStore } from '../../lib/store/authStore';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Link2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await authApi.login(data);
      login(result.accessToken, result.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setValue('email', 'demo@linkforge.dev');
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-md border border-gray-200 p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-xs">
              <Link2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h2>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2.5 text-xs text-red-700 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••••••"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2 px-3 border border-dashed border-brand-200 rounded text-xs text-brand-600 hover:bg-brand-50 transition-colors font-medium text-center"
            >
              Fill demo credentials (demo@linkforge.dev)
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
