import './globals.css';
import { ToastProvider } from '../components/ui/Toast';
import { QueryProvider } from '../components/providers/QueryProvider';
export const metadata = {
    title: 'LinkForge — Fast, Reliable URL Shortener & Analytics',
    description: 'A production-grade URL shortening platform with sub-50ms Redis-cached redirects, rich click analytics, custom aliases, and zero bloat.',
};
export default function RootLayout({ children }) {
    return (<html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-brand-500 selection:text-white">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>);
}
