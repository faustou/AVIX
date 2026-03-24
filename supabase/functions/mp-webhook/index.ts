import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()

    // MP envía el pago como topic=payment o en data.id
    const paymentId: string | undefined =
      body?.data?.id ?? body?.id ?? undefined

    if (!paymentId) {
      return new Response('ok', { status: 200 })
    }

    // Consultar el pago en MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    })

    if (!mpRes.ok) {
      console.error(`Error consultando pago ${paymentId}: ${mpRes.status}`)
      return new Response('error consultando MP', { status: 502 })
    }

    const payment = await mpRes.json()
    const orderId: string = payment.external_reference

    if (!orderId) {
      console.error('Pago sin external_reference', paymentId)
      return new Response('ok', { status: 200 })
    }

    if (payment.status === 'approved') {
      // Actualizar orden a paid
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'paid', mp_payment_id: String(paymentId) })
        .eq('id', orderId)

      if (updateErr) {
        console.error('Error actualizando orden:', updateErr.message)
        return new Response('error db', { status: 500 })
      }

      // Obtener items de la orden para descontar stock
      const { data: orderItems, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id, size, quantity')
        .eq('order_id', orderId)

      if (itemsErr) {
        console.error('Error leyendo order_items:', itemsErr.message)
        return new Response('error db', { status: 500 })
      }

      // Descontar stock de cada talla
      for (const item of orderItems ?? []) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      }
    } else if (payment.status === 'rejected') {
      await supabase
        .from('orders')
        .update({ status: 'failed', mp_payment_id: String(paymentId) })
        .eq('id', orderId)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('mp-webhook error:', (err as Error).message)
    return new Response('internal error', { status: 500 })
  }
})
