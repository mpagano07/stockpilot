"use client";

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, tenant, loading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-24 bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {profile?.full_name || 'Usuario'}
          </h1>
          {tenant && (
            <p className="text-gray-600 mt-1">
              Empresa: <strong>{tenant.name}</strong>
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          Cerrar sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Ventas hoy</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">$0</p>
          <p className="text-xs text-gray-500 mt-2">+0% vs ayer</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Stock crítico</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">0</p>
          <p className="text-xs text-gray-500 mt-2">Productos</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total productos</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-2">En inventario</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Usuarios</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">1</p>
          <p className="text-xs text-gray-500 mt-2">En tu empresa</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Próximas acciones</h2>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>Configura tus categorías de productos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>Agrega tu primer producto</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>Invita a otros usuarios a tu empresa</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
