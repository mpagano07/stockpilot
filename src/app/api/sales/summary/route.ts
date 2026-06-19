import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);
  if (!tu || tu.length === 0) return NextResponse.json({ error: 'No tenant' }, { status: 401 });
  const tenantId = tu[0].tenant_id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: sales, error } = await supabaseAdmin
    .from('sales')
    .select('created_at, total_cents')
    .eq('tenant_id', tenantId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const dailyTotals: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    dailyTotals[key] = 0;
  }

  for (const sale of (sales ?? [])) {
    const day = (sale.created_at as string).slice(0, 10);
    if (dailyTotals[day] !== undefined) {
      dailyTotals[day] += (sale.total_cents as number) || 0;
    }
  }

  const formatted = Object.entries(dailyTotals).map(([date, total]) => {
    const d = new Date(date + 'T12:00:00');
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return {
      date,
      day: days[d.getDay()],
      total: total / 100,
    };
  });

  return NextResponse.json(formatted);
}
