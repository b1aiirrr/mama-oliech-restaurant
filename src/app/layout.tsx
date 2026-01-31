import type { Metadata } from 'next';
import { DM_Serif_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

const displayFont = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = Source_Sans_3({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Mama Oliech Restaurant | Fresh Lake Victoria Tilapia & Ugali in Nairobi',
  description:
    'The taste of Lake Victoria in the heart of Nairobi. Mama Oliech Restaurant serves legendary fresh tilapia, ugali, kachumbari & Kenyan cuisine on Marcus Garvey Road, Kilimani.',
  keywords: [
    'Kenyan food',
    'tilapia',
    'Nairobi restaurants',
    'Lake Victoria fish',
    'ugali',
    'Mama Oliech',
    'Kilimani restaurant',
    'Kenyan cuisine',
  ],
  openGraph: {
    title: 'Mama Oliech Restaurant | Fresh Tilapia & Ugali in Nairobi',
    description: 'The taste of Lake Victoria in the heart of Nairobi.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream text-charcoal">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
