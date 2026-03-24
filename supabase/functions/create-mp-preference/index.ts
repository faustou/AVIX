import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  title: string
  quantity: number
  unit_price: number
  size: string
}

interface RequestBody {
  items: CartItem[]
  email: string
  orderId: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const APP_URL = Deno.env.get('APP_URL')

    if (!MP_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'MP_ACCESS_TOKEN no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { items, email, orderId }: RequestBody = await req.json()

    const preference = {
      items: items.map((item) => ({
        title: `${item.title} - Talle ${item.size}`,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
      })),
      payer: { email },
      external_reference: orderId,
      back_urls: {
        success: `${APP_URL}/checkout/success`,
        failure: `${APP_URL}/checkout/failure`,
        pending: `${APP_URL}/checkout/pending`,
      },
      notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const errBody = await mpRes.text()
      return new Response(
        JSON.stringify({ error: `Error MP: ${mpRes.status} — ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const data = await mpRes.json()

    return new Response(
      JSON.stringify({ preferenceId: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
