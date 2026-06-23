import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Contraseña inválida' }, { status: 400 });
    }

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('email, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find(
      (u: any) => u.email?.toLowerCase() === tokenData.email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 });
    }

    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('token', token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in update-password:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
