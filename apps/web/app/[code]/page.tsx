import { redirect, notFound } from 'next/navigation';

interface Props {
  params: {
    code: string;
  };
}

export default async function RedirectPage({ params }: Props) {
  const code = params.code;
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/${code}`, {
      method: 'GET',
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
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h1 className="text-6xl font-extrabold text-red-500 font-mono mb-2">410</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h2>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            The link <strong>{code}</strong> is no longer accessible because its scheduled expiration date has passed.
          </p>
          <a href="/" className="px-4 py-2 bg-brand-500 text-white rounded text-xs font-semibold">
            Create your own links &rarr;
          </a>
        </div>
      );
    }

    notFound();
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    notFound();
  }
}
