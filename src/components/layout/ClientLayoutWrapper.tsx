'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/ui/header';
import { SidebarProvider } from '@/lib/contexts/sidebar-context';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define public routes that do not get the dashboard sidebar, header, or dashboard padding wrappers
  const isPublicRoute = 
    pathname === '/' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/accept-invite');

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row flex-1 min-h-screen w-full">
        <React.Suspense fallback={<div />}> 
          <Sidebar />
        </React.Suspense>
        <div className="flex flex-col flex-1 w-full">
          <React.Suspense fallback={<div />}>
            <Header />
          </React.Suspense>
          <main className="flex-1 w-full overflow-auto bg-gray-50 dark:bg-gray-950">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
