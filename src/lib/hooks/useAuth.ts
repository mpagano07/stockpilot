"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionTokenHeaders = async () => {
      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;
      const refreshToken = sessionResult.data.session?.refresh_token;

      return {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(refreshToken ? { 'x-refresh-token': refreshToken } : {}),
      };
    };

    const initAuth = async () => {
      try {
        const headers = await getSessionTokenHeaders();
        const response = await fetch('/api/session', {
          credentials: 'include',
          headers,
        });
        if (!response.ok) {
          throw new Error('No authenticated session');
        }

        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setTenant(data.tenant);
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const headers = await getSessionTokenHeaders();
          const response = await fetch('/api/session', {
            credentials: 'include',
            headers,
          });
          if (!response.ok) {
            setProfile(null);
            setTenant(null);
            return;
          }

          const data = await response.json();
          setProfile(data.profile);
          setTenant(data.tenant);
        } catch (error) {
          console.error('Auth state update error:', error);
        }
      } else {
        setProfile(null);
        setTenant(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setTenant(null);
  };

  return {
    user,
    profile,
    tenant,
    loading,
    logout,
    isAuthenticated: !!user,
  };
}
