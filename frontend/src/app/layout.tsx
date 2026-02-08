import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'KALAVPP - ArtCommerce & Creative Services Platform',
  description: 'Discover and purchase unique art, commission custom creatives, and book creative services from talented artists worldwide.',
  keywords: 'art, creative services, marketplace, commissions, digital art, physical art',
  authors: [{ name: 'KALAVPP Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kalavpp.com',
    title: 'KALAVPP - ArtCommerce & Creative Services Platform',
    description: 'Discover and purchase unique art, commission custom creatives, and book creative services.',
    siteName: 'KALAVPP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KALAVPP - ArtCommerce & Creative Services Platform',
    description: 'Discover and purchase unique art and creative services.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
