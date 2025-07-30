
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { PT_Sans } from 'next/font/google';
import { LanguageProvider } from './(public)/LanguageProvider';
import { Drawer } from '@/components/ui/drawer';

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700']
});


export const metadata: Metadata = {
  title: 'Parent Portal | Maes Y Morfa School',
  description: 'Public website and parent portal for Maes Y Morfa school.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/mobile-icon.png?v=2" type="image/png" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased", ptSans.variable)}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
