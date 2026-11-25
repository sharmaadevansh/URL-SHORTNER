'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store/authStore';
import { Button } from '../ui/Button';
import { Link2 } from 'lucide-react';
export function PublicNavbar() {
    const { isAuthenticated } = useAuthStore();
    return (<header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-brand-600 transition-colors">
            <Link2 className="w-5 h-5"/>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">
            Link<span className="text-brand-500">Forge</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
            How It Works
          </a>
          <a href="#architecture" className="hover:text-gray-900 transition-colors">
            Architecture
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (<Link href="/dashboard">
              <Button variant="primary" size="sm">
                Dashboard &rarr;
              </Button>
            </Link>) : (<>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>)}
        </div>
      </div>
    </header>);
}
