import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Link2 } from 'lucide-react';
export default function NotFound() {
    return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-12 h-12 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold mb-6 shadow-xs">
        <Link2 className="w-7 h-7"/>
      </div>

      <h1 className="text-7xl font-extrabold text-gray-300 font-mono tracking-tighter mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Page not found.</h2>
      <p className="text-xs text-gray-500 max-w-sm mb-8 leading-relaxed">
        We could not find the page or short link you were looking for. It may have expired, been disabled, or never existed.
      </p>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" size="md">
            &larr; Back to Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Go to Dashboard &rarr;
          </Button>
        </Link>
      </div>
    </div>);
}
