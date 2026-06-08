import './globals.css';
import { Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/ui/header';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StockPilot',
  description: 'Plataforma SaaS B2B de gestión de stock y ventas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <head />
      <body className="min-h-screen bg-gray-50 antialiased flex">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
