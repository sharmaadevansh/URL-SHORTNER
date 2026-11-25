import React from 'react';
import Link from 'next/link';
import { Link2 } from 'lucide-react';
export function Footer() {
    return (<footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
              <Link2 className="w-4 h-4"/>
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-900">LinkForge</span>
            <span className="text-xs text-gray-400 ml-2">
              &copy; {new Date().getFullYear()} LinkForge. Production-ready URL shortener.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>);
}
