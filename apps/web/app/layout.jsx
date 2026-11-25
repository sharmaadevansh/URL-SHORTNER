import './globals.css';
import { ToastProvider } from '../components/ui/Toast';
import { QueryProvider } from '../components/providers/QueryProvider';

export const metadata = {
  title: 'LinkForge — URL Shortener & Analytics',
  description:
    'Fast URL shortener with custom aliases, expiration controls, and click analytics built with Next.js, Express, and MongoDB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-brand-500 selection:text-white">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
