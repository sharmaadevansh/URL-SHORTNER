'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/authStore';
import { authApi } from '../../lib/api/auth.api';
import { Link2, Settings, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const handleLogout = async () => {
        try {
            await authApi.logout();
        }
        catch { }
        logout();
        router.push('/login');
    };
    const navItems = [
        {
            label: 'Links',
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
    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U';
    return (<>
      {/* Desktop Sidebar (240px, Dark theme) */}
      <aside className="hidden md:flex flex-col w-60 h-screen bg-gray-950 text-gray-300 fixed left-0 top-0 border-r border-gray-900 z-30 select-none">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-900">
          <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Link2 className="w-5 h-5"/>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Link<span className="text-brand-500">Forge</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (<Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors', item.isActive
                    ? 'bg-brand-500/10 text-brand-500 font-semibold border-l-2 border-brand-500 rounded-l-none'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900')}>
                <Icon className="w-4 h-4"/>
                {item.label}
              </Link>);
        })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-700 text-white font-medium text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} title="Log out" aria-label="Log out" className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-900 transition-colors">
            <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-gray-900 flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
            const Icon = item.icon;
            return (<Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded', item.isActive ? 'text-brand-500' : 'text-gray-400')}>
              <Icon className="w-5 h-5"/>
              {item.label}
            </Link>);
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 text-gray-400">
          <LogOut className="w-5 h-5"/>
          Logout
        </button>
      </nav>
    </>);
}
