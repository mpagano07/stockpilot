import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('email, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: 'Token inválido' });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expirado' });
    }

    return NextResponse.json({ valid: true, email: data.email });
  } catch (err) {
    console.error('Error verifying reset token:', err);
    return NextResponse.json({ valid: false, error: 'Error interno' });
  }
}
