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
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const products = (data as any[])?.map((p: any) => ({
    ...p,
    price: p.price_cents != null ? p.price_cents / 100 : 0,
  })) || [];
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const tenantId = await getAuthenticatedTenant();
  if (!tenantId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const allowedFields = ['category_id', 'sku', 'barcode', 'name', 'description', 'cost', 'stock', 'min_stock', 'max_stock', 'image_url', 'metadata'];
  const insertData: Record<string, any> = { tenant_id: tenantId };
  if (body.price !== undefined) insertData.price_cents = Math.round(body.price * 100);
  for (const key of allowedFields) {
    if (body[key] !== undefined) insertData[key] = body[key];
  }
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(insertData)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const created = data?.[0];
  return NextResponse.json(created ? { ...created, price: (created as any).price_cents != null ? (created as any).price_cents / 100 : 0 } : null, { status: 201 });
}
