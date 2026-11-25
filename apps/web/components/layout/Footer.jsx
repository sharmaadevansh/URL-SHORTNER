import React from 'react';
import Link from 'next/link';
import { Link2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-900">LinkForge</span>
            <span className="text-xs text-gray-400">&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/#features" className="hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/#architecture" className="hover:text-gray-900 transition-colors">
              Tech Stack
            </Link>
            <a
              href="https://github.com/sharmaadevansh/URL-SHORTNER"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 transition-colors font-medium"
            >
              GitHub &rarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
