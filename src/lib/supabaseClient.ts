'use client';

import { createBrowserClient } from '@supabase/ssr';
import { parse, serialize } from 'cookie';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return [];
        return Object.entries(parse(document.cookie)).map(
          ([name, value]) => ({ name, value: value ?? '' })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = serialize(name, value, options as any);
        });
      },
    },
  }
);

export default supabase;
