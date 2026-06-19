import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);
  if (!tu || tu.length === 0) return NextResponse.json({ error: 'No tenant' }, { status: 401 });

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', tu[0].tenant_id)
    .single();

  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${request.headers.get('origin')}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
