import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Esperit - AI-Powered Personal Growth Platform',
  description:
    'Explore your potential through conversations with AI personas. Get guidance on career, life balance, and personal growth tailored for India.',
  keywords: ['AI', 'personal growth', 'career guidance', 'life coaching', 'future self', 'India'],
  authors: [{ name: 'Esperit Team' }],
  openGraph: {
    title: 'Esperit - AI-Powered Personal Growth Platform',
    description:
      'Explore personal growth through meaningful conversations with AI personas representing your aspirational future.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Esperit - AI-Powered Personal Growth Platform',
    description: 'Explore your potential through AI-powered conversations with your future self.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
