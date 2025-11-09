import type { Metadata, Viewport } from 'next';

import { Geist } from 'next/font/google';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Providers } from '@/components/layout/providers';
import { Scripts } from '@/components/layout/scripts';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

import '@/app/globals.css';

const font = Geist({
  display: 'swap',
  variable: '--font-sans',
  weight: [
    '500',
    '700',
  ],
  subsets: [
    'latin',
  ],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Front-End Development',
    template: '%s | Front-End Development',
  },
  description: 'Front-End Development',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Front-End Development',
    locale: 'en',
    images: [
      {
        url: '/static/frontend-dev-thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Front-End Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/static/frontend-dev-icon.svg',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn(
          font.variable,
          'overflow-x-hidden touch-pan-y scroll-smooth',
          'flex flex-col min-h-dvh',
          'font-sans antialiased',
        )}
      >
        <Providers>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
