import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createActivityLog } from '@/lib/activity-log';

async function getAuthenticatedTenant(): Promise<{ tenantId: string; userId: string } | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);

  if (!tu || tu.length === 0) return null;
  return { tenantId: (tu as any)[0].tenant_id, userId: user.id };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthenticatedTenant();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await request.json();
    const allowedFields = [
      'category_id', 'sku', 'barcode', 'name', 'description',
      'cost', 'stock', 'min_stock', 'max_stock', 'image_url', 'metadata',
    ];
    const updateData: Record<string, any> = {};
    if (body.price !== undefined) updateData.price_cents = Math.round(body.price * 100);
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', auth.tenantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createActivityLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'updated',
      entityType: 'product',
      entityId: id,
      details: { name: data?.name },
    });

    return NextResponse.json({ ...data, price: (data as any).price_cents != null ? (data as any).price_cents / 100 : 0 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthenticatedTenant();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: deleted } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('tenant_id', auth.tenantId)
    .select('name')
    .single();

  if (!deleted) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  await createActivityLog({
    tenantId: auth.tenantId,
    userId: auth.userId,
    action: 'deleted',
    entityType: 'product',
    details: { name: (deleted as any).name },
  });

  return NextResponse.json({ success: true });
}
