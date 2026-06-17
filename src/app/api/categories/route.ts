import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function getAuthenticatedTenant(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);

  if (!tu || tu.length === 0) return null;
  return (tu as any)[0].tenant_id;
}

export async function GET() {
  const tenantId = await getAuthenticatedTenant();
  if (!tenantId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const tenantId = await getAuthenticatedTenant();
  if (!tenantId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: body.name,
        description: body.description || null,
        icon: body.icon || null,
        color: body.color || null,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
