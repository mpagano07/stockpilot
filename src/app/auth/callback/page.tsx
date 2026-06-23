'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let code = searchParams?.get('code');
    if (!code && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      code = url.searchParams.get('code');
    }

    if (!code) {
      router.replace('/login?error=missing_code');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
      if (error) {
        router.replace('/login?error=auth_failed');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        router.replace('/login');
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
        router.replace('/accept-invite');
        return;
      }

      // If no invites were pending, this might be a password reset flow.
      // Redirect to reset-password — the session is already established,
      // so the page will show the form immediately.
      router.replace('/auth/reset-password');
    });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
