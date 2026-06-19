import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@/lib/supabase';
import OpenAI from 'openai';

async function getAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: tu } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id);
  if (!tu || tu.length === 0) return null;
  return { userId: user.id, tenantId: tu[0].tenant_id as string };
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
    return NextResponse.json({ error: 'API de IA no configurada. Configurá OPENAI_API_KEY en .env.local' }, { status: 503 });
  }

  const { imageUrl } = await request.json();
  if (!imageUrl) {
    return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 });
  }

  const [productsData, categoriesData] = await Promise.all([
    supabaseAdmin.from('products').select('name, stock, min_stock, sku, price_cents, cost').eq('tenant_id', auth.tenantId),
    supabaseAdmin.from('categories').select('id, name').eq('tenant_id', auth.tenantId),
  ]);

  const productNames = (productsData.data || []).map((p: any) => p.name).join(', ');
  const categoryNames = (categoriesData.data || []).map((c: any) => c.name).join(', ');

  const openai = new OpenAI({ apiKey });

  const prompt = `Analizá esta foto de una góndola o estante de un negocio.
Productos registrados en el sistema: ${productNames || 'No hay productos registrados'}.
Categorías: ${categoryNames || 'Sin categorías'}.

Respondé en español con este formato JSON (sin markdown):
{
  "description": "Descripción breve de lo que se ve en la imagen",
  "estimatedStock": [
    { "productName": "nombre del producto detectado", "estimatedQuantity": 5, "confidence": "alta/media/baja" }
  ],
  "observations": ["observación 1", "observación 2"],
  "suggestedActions": ["acción recomendada 1"]
}

Si no se ve una góndola o productos en la imagen, devolvé un JSON con description explicando qué se ve y estimatedStock vacío.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { description: reply, estimatedStock: [], observations: [], suggestedActions: [] };
    }

    // Compare with actual inventory
    const matched: any[] = [];
    if (parsed.estimatedStock && productsData.data) {
      for (const est of parsed.estimatedStock) {
        const actual = (productsData.data as any[]).find(
          (p) => p.name.toLowerCase().includes(est.productName.toLowerCase()) ||
                 est.productName.toLowerCase().includes(p.name.toLowerCase())
        );
        matched.push({
          ...est,
          actualProduct: actual ? { name: actual.name, stock: actual.stock, minStock: actual.min_stock } : null,
          matchFound: !!actual,
        });
      }
    }

    return NextResponse.json({
      analysis: parsed,
      matchedProducts: matched,
      productCount: productsData.data?.length || 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al analizar imagen';
    console.error('Vision API error:', msg);
    return NextResponse.json({ error: 'Error al analizar la imagen con IA' }, { status: 500 });
  }
}
