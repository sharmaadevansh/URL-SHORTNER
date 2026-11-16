'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@linkforge/shared';
import { authApi } from '../../lib/api/auth.api';
import { useAuthStore } from '../../lib/store/authStore';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { Link2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get('prefill');
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await authApi.register(data);
      login(result.accessToken, result.user);
      toast.success('Account created successfully!');

      if (prefill) {
        router.push(`/dashboard?prefill=${encodeURIComponent(prefill)}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to create account. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-md border border-gray-200 p-8 shadow-xs">
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-xs">
          <Link2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="text-xs text-gray-500 mt-1">Start shortening and tracking links in seconds</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2.5 text-xs text-red-700 animate-slide-down">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="text"
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
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
          <PasswordStrength password={passwordValue} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in &rarr;
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense fallback={<Spinner size="lg" className="text-brand-500" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
