import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const tenantId = session.metadata?.tenant_id;
        if (tenantId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await supabaseAdmin
            .from('tenants')
            .update({
              subscription_status: 'active',
              subscription_plan: subscription.items.data[0]?.price?.metadata?.plan || 'starter',
              subscription_id: session.subscription,
              subscription_current_period_end: new Date(
                (subscription as any).current_period_end * 1000
              ).toISOString(),
              stripe_customer_id: session.customer,
            })
            .eq('id', tenantId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { data: tenants } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', sub.customer);

        if (tenants && tenants.length > 0) {
          const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status === 'active' ? 'active' : 'past_due';
          const plan = sub.items?.data?.[0]?.price?.metadata?.plan || 'starter';

          await supabaseAdmin
            .from('tenants')
            .update({
              subscription_status: status,
              subscription_plan: status === 'canceled' ? 'free' : plan,
              subscription_current_period_end: (sub as any).current_period_end
                ? new Date((sub as any).current_period_end * 1000).toISOString()
                : null,
            })
            .eq('stripe_customer_id', sub.customer);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const { data: tenants } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', invoice.customer);

        if (tenants && tenants.length > 0) {
          await supabaseAdmin
            .from('tenants')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', invoice.customer);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }

  return NextResponse.json({ received: true });
}
