import type { Metadata } from 'next';
import { EB_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/language-context';

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
  description: 'Un sitio web para el coro NovaMvsica.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', rel: 'icon', type: 'image/x-icon' },
      { url: '/favicon.ico?v=2', rel: 'shortcut icon', type: 'image/x-icon' },
    ],
    apple: '/apple-touch-icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <html lang="en" className={`dark ${ebGaramond.variable} ${montserrat.variable}`}>
        <head>
          <link rel="icon" href="/favicon.ico?v=3" />
          <link rel="shortcut icon" href="/favicon.ico?v=3" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        </head>
        <body className="font-body antialiased">{children}<Toaster /></body>
      </html>
    </LanguageProvider>
  );
}
