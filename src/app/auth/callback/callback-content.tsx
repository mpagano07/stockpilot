'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw userError || new Error('No user found');

        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        const refreshToken = session.data.session?.refresh_token;

        const sessionResponse = await fetch('/api/session', {
          credentials: 'include',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(refreshToken ? { 'x-refresh-token': refreshToken } : {}),
          },
        });
        if (!sessionResponse.ok) {
          throw new Error('Failed to load session');
        }

        const sessionData = await sessionResponse.json();

        if (sessionData.profile && sessionData.tenant) {
          router.push(`/dashboard?tenant=${sessionData.tenant.id}`);
        } else {
          router.push('/onboarding');
        }
      } catch (error: unknown) {
        console.error('Auth callback error:', error);
        const message = error instanceof Error ? error.message : 'Error al autenticar. El link puede haber expirado.';
        toast.error(message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center">
        {loading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Completando acceso...</p>
          </div>
        ) : (
          <p className="text-gray-600">Redirigiendo...</p>
        )}
      </Card>
    </div>
  );
}

export default AuthCallbackContent;
