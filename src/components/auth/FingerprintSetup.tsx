'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  isPlatformAuthenticatorAvailable,
  getStoredCredential,
  registerBiometric,
  storeRefreshToken,
} from '@/lib/webauthn';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Fingerprint, Smartphone, Check, X, Loader2 } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function FingerprintSetup({ onComplete, onSkip }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setAvailable);
  }, []);

  const handleEnable = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      await registerBiometric(
        session.user.id,
        session.user.email ?? '',
        session.user.user_metadata?.full_name ?? session.user.email ?? '',
      );

      storeRefreshToken(session.refresh_token);
      setDone(true);
      toast.success('Ingreso con huella activado');
      setTimeout(onComplete, 1000);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al configurar huella';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  // Already configured or checking availability
  if (getStoredCredential()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        {available === null ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-sm text-gray-400">Verificando dispositivo...</p>
          </div>
        ) : available ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-indigo-500/20 p-2.5">
                <Fingerprint className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Ingreso rápido</h2>
                <p className="text-xs text-gray-400">Con tu huella digital</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              Activá el ingreso con huella digital para no tener que escribir tu email
              y contraseña cada vez que entres a StockPilot desde este dispositivo.
            </p>

            {done ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-sm font-medium text-green-400">¡Activado!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleEnable}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Configurando...</>
                  ) : (
                    <><Smartphone className="h-4 w-4" /> Activar huella digital</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={loading}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-1" /> Ahora no
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-gray-700 p-2.5">
                <Fingerprint className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Ingreso con huella</h2>
                <p className="text-xs text-gray-400">No disponible</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              Este dispositivo no tiene un sensor biométrico disponible o no está
              configurado. Si querés, podés activarlo después desde Configuración.
            </p>

            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Continuar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
