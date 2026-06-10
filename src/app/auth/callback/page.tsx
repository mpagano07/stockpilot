import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import AuthCallbackContent from './callback-content';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Completando acceso...</p>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
