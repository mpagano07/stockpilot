import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getPreApprovalById } from '@/lib/mercadopago';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const topic = body.type || body.topic;
    const id = body.data?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    if (topic === 'subscription_preapproval' || topic === 'preapproval') {
      const preapproval = await getPreApprovalById(id);

      const externalRef = preapproval.external_reference;
      const status = preapproval.status;

      if (!externalRef) {
        return NextResponse.json({ error: 'No external reference' }, { status: 400 });
      }

      if (status === 'authorized') {
        await supabaseAdmin
          .from('tenants')
          .update({
            subscription_status: 'active',
            mercadopago_preapproval_id: id,
          })
          .eq('id', externalRef);
      } else if (status === 'cancelled') {
        await supabaseAdmin
          .from('tenants')
          .update({
            subscription_status: 'canceled',
            subscription_plan: 'free',
            mercadopago_preapproval_id: null,
          })
          .eq('id', externalRef);
      } else if (status === 'pending') {
      }
    }
  } catch (err) {
    console.error('MercadoPago webhook error:', err);
  }

  return NextResponse.json({ received: true });
}
