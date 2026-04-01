import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendOrderConfirmationEmail(order: any, orderItems: any[], resendApiKey: string) {
  const addr = order.shipping_address
  const orderShortId = String(order.id).slice(0, 8).toUpperCase()

  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr>
        <td style="font-size:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
          ${item.products?.code ?? '—'} <span style="color:#999;">(${item.size})</span> × ${item.quantity}
        </td>
        <td style="font-size:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;">
          $${(item.unit_price * item.quantity).toLocaleString('es-AR')}
        </td>
      </tr>`,
    )
    .join('')

  const shippingRow =
    order.shipping_cost && order.shipping_cost > 0
      ? `<tr>
          <td style="font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:10px 0;color:#999;">
            Envío${order.shipping_carrier ? ` — ${order.shipping_carrier}` : ''}
          </td>
          <td style="font-size:12px;padding:10px 0;text-align:right;color:#999;">
            $${Number(order.shipping_cost).toLocaleString('es-AR')}
          </td>
        </tr>`
      : ''

  const addressSection = addr
    ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #eee;">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 10px;">DIRECCIÓN DE ENVÍO</p>
        <p style="font-size:12px;line-height:1.8;margin:0;color:#000;">
          ${addr.nombre} ${addr.apellido}<br>
          ${addr.calle} ${addr.numero}${addr.piso ? `, Piso ${addr.piso}` : ''}${addr.depto ? ` Depto ${addr.depto}` : ''}<br>
          ${addr.localidad} (${addr.cp}), ${addr.provincia}
        </p>
      </div>`
    : ''

  const html = `
    <div style="font-family:'Courier New',monospace;max-width:480px;margin:0 auto;padding:32px;background:#fff;color:#000;">
      <div style="font-size:18px;letter-spacing:4px;text-transform:uppercase;margin-bottom:32px;font-weight:bold;">AVIX</div>

      <h1 style="font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;font-weight:normal;">PEDIDO CONFIRMADO</h1>
      <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;margin:0 0 32px;">#${orderShortId}</p>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #000;">
            <th style="font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:0 0 10px;text-align:left;font-weight:normal;color:#999;">PRODUCTO</th>
            <th style="font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:0 0 10px;text-align:right;font-weight:normal;color:#999;">PRECIO</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          ${shippingRow}
          <tr style="border-top:2px solid #000;">
            <td style="font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:14px 0 0;font-weight:bold;">TOTAL</td>
            <td style="font-size:12px;padding:14px 0 0;text-align:right;font-weight:bold;">$${Number(order.total).toLocaleString('es-AR')}</td>
          </tr>
        </tfoot>
      </table>

      ${addressSection}

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0;">
          Te avisaremos cuando tu pedido sea despachado.
        </p>
      </div>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AVIX <onboarding@resend.dev>',
      to: [order.email],
      subject: `Tu pedido #${orderShortId} fue confirmado 🎉`,
      html,
    }),
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()

    const paymentId: string | undefined = body?.data?.id ?? body?.id ?? undefined

    if (!paymentId) {
      return new Response('ok', { status: 200 })
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
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
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'paid', mp_payment_id: String(paymentId) })
        .eq('id', orderId)

      if (updateErr) {
        console.error('Error actualizando orden:', updateErr.message)
        return new Response('error db', { status: 500 })
      }

      // Obtener items para descontar stock y para el email
      const { data: orderItems, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id, size, quantity, unit_price, products(code)')
        .eq('order_id', orderId)

      if (itemsErr) {
        console.error('Error leyendo order_items:', itemsErr.message)
        return new Response('error db', { status: 500 })
      }

      for (const item of orderItems ?? []) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      }

      // Enviar email de confirmación
      if (RESEND_API_KEY) {
        const { data: order } = await supabase
          .from('orders')
          .select('email, total, shipping_address, shipping_cost, shipping_carrier')
          .eq('id', orderId)
          .single()

        if (order?.email) {
          try {
            await sendOrderConfirmationEmail(order, orderItems ?? [], RESEND_API_KEY)
          } catch (emailErr) {
            // El email no es crítico — logueamos pero no fallamos el webhook
            console.error('Error enviando email de confirmación:', (emailErr as Error).message)
          }
        }
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
