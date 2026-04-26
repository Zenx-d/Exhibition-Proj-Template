import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingOverlay from '../components/LoadingOverlay';
import { LoadingProvider } from '../components/LoadingProvider';
import TelemetryProvider from '../components/TelemetryProvider';
import CookieConsent from '../components/CookieConsent';
import configData from '../data/config.json';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: configData.siteTitle,
  description: configData.siteDescription,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <LoadingProvider>
          <Suspense fallback={null}>
            <TelemetryProvider />
          </Suspense>
          <LoadingOverlay />
          <Navbar />
        <main className="flex-grow w-full pt-28 md:pt-32 pb-16 md:pb-20">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
          <Footer />
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </LoadingProvider>
      </body>
    </html>
  );
}
