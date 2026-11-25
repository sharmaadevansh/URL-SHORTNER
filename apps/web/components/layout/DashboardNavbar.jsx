'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Link2, Settings } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { cn } from '../../lib/utils';

export function DashboardNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'My Links',
      href: '/dashboard',
      icon: Link2,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/links'),
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      isActive: pathname === '/dashboard/settings',
    },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand + Primary Nav Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-brand-600 transition-colors">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Link<span className="text-brand-500">Forge</span>
            </span>
          </Link>

          <nav aria-label="Dashboard navigation" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                    item.isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: User Profile Dropdown (contains all links on mobile too) */}
        <div className="flex items-center gap-3">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
