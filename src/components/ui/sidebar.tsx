"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Productos', href: '/products' },
  { name: 'Escáner', href: '/scanning' },
  { name: 'Configuración', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col w-64 h-screen bg-gray-900 text-white p-4">
      <div className="mb-8 text-2xl font-bold text-primary-500">StockPilot</div>
      <nav className="flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <Button variant="outline" className="mt-4 w-full" onClick={() => alert('Cerrar sesión')}>Logout</Button>
    </aside>
  );
}
