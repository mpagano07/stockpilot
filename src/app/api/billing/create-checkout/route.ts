import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);
  if (!tu || tu.length === 0) return NextResponse.json({ error: 'No tenant' }, { status: 401 });

  const tenantId = tu[0].tenant_id;

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_customer_id, name, billing_email')
    .eq('id', tenantId)
    .single();

  const { plan } = await request.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];

  if (!planConfig || !planConfig.priceId) {
    return NextResponse.json({ error: 'Plan inválido o no disponible' }, { status: 400 });
  }

  let customerId = tenant?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant?.billing_email || user.email,
      name: tenant?.name || 'Empresa',
      metadata: { tenant_id: tenantId },
    });
    customerId = customer.id;
    await supabaseAdmin.from('tenants').update({ stripe_customer_id: customerId }).eq('id', tenantId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${request.headers.get('origin')}/billing?success=true`,
    cancel_url: `${request.headers.get('origin')}/billing?canceled=true`,
    metadata: { tenant_id: tenantId },
  });

  return NextResponse.json({ url: session.url });
}
