import type { Metadata } from 'next';
import { EB_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-eb-garamond',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'NovaMvsica',
  description: 'A website for the NovaMvsica choir.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${ebGaramond.variable} ${montserrat.variable}`}>
      <head>
      </head>
      <body className="font-body antialiased">{children}<Toaster /></body>
    </html>
  );
}