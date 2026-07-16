import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { AuthListener } from '@/components/auth-listener';
import { Providers } from '@/components/providers';
import { ServiceWorkerRegister } from '@/components/service-worker-register';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pelada IET',
  description: 'Sorteio de times da pelada semanal',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pelada IET',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d160f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <AuthListener />
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
