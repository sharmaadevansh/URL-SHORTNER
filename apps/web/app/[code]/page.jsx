import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { RESERVED_SLUGS } from '@linkforge/shared';
export default async function RedirectPage({ params }) {
    const code = params.code;
    if (!code || code.includes('.') || RESERVED_SLUGS.includes(code.toLowerCase())) {
        notFound();
    }
    const apiUrl = (process.env.API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:4000').replace(/\/+$/, '');
    const reqHeaders = headers();
    const forwardHeaders = {};
    const userAgent = reqHeaders.get('user-agent');
    const referer = reqHeaders.get('referer');
    if (userAgent)
        forwardHeaders['user-agent'] = userAgent;
    if (referer)
        forwardHeaders['referer'] = referer;
    try {
        const res = await fetch(`${apiUrl}/${code}`, {
            method: 'GET',
            headers: forwardHeaders,
            redirect: 'manual',
            cache: 'no-store',
        });
        if (res.status === 302 || res.status === 301) {
            const location = res.headers.get('location');
            if (location) {
                redirect(location);
            }
        }
        if (res.status === 410) {
            return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h1 className="text-6xl font-extrabold text-red-500 font-mono mb-2">410</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h2>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            The link <strong>{code}</strong> is no longer accessible because its scheduled expiration date has passed.
          </p>
          <a href="/" className="px-4 py-2 bg-brand-500 text-white rounded text-xs font-semibold">
            Create your own links &rarr;
          </a>
        </div>);
        }
        notFound();
    }
    catch (err) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
            throw err;
        }
        notFound();
    }
}
