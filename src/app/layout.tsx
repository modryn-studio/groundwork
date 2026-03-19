import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/config/site';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: site.ogTitle,
  description: site.description,
  openGraph: {
    title: site.ogTitle,
    description: site.ogDescription,
    url: site.url,
    siteName: site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.ogTitle,
    description: site.ogDescription,
    creator: site.social.twitterHandle,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
