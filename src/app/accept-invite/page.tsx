'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AcceptInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'accepted' | 'error'>('processing');

  useEffect(() => {
    async function accept() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setStatus('error');
          return;
        }

        const res = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'x-refresh-token': session.refresh_token ?? '',
          },
        });
        const data = await res.json();

        if (data.accepted > 0) {
          setStatus('accepted');
          setTimeout(() => router.push('/'), 1500);
        } else {
          router.push('/');
        }
      } catch {
        setStatus('error');
      }
    }
    accept();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto" />
            <p className="mt-4 text-gray-600">Aceptando invitación...</p>
          </>
        )}
        {status === 'accepted' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="mt-4 text-gray-600">¡Invitación aceptada!</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-gray-600">
              Error al aceptar la invitación. Intenta iniciar sesión.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
