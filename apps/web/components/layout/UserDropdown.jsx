'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/authStore';
import { authApi } from '../../lib/api/auth.api';
import { ChevronDown, Link2, Settings, Home, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export function UserDropdown() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const menuItems = [
    {
      label: 'My Links',
      href: '/dashboard',
      icon: Link2,
      active: pathname === '/dashboard' || pathname.startsWith('/dashboard/links'),
    },
    {
      label: 'Account Settings',
      href: '/dashboard/settings',
      icon: Settings,
      active: pathname === '/dashboard/settings',
    },
    {
      label: 'Public Home',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          open
            ? 'border-brand-300 bg-brand-50/60 shadow-xs'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-semibold text-xs flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left max-w-[130px]">
          <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
            {user?.name || 'Account'}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-gray-500 transition-transform duration-150',
            open && 'rotate-180 text-brand-600'
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-md bg-white border border-gray-200 shadow-lg py-1.5 z-50 animate-slide-down"
        >
          {/* User Identity Header */}
          <div className="px-3.5 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
          </div>

          {/* Navigation Items */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors',
                    item.active
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-gray-100">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
