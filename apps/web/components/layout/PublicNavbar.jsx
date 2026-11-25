'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store/authStore';
import { Button } from '../ui/Button';
import { UserDropdown } from './UserDropdown';
import { Link2, Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const { isAuthenticated, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    try {
      const cached = localStorage.getItem('user_info');
      if (cached) setUser(JSON.parse(cached));
    } catch {}
  }, [setUser]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Architecture', href: '/#architecture' },
  ];

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-brand-600 transition-colors">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">
            Link<span className="text-brand-500">Forge</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-900 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {mounted && isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-block">
                <Button variant="primary" size="sm">
                  Dashboard &rarr;
                </Button>
              </Link>
              <UserDropdown />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
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
            </div>
          )}

          {/* Mobile dropdown trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown List */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-md animate-slide-down">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
          {!(mounted && isAuthenticated) && (
            <div className="pt-2 mt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
