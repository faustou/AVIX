import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiter en memoria (protección básica; se reinicia en cold start)
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const max = 3
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= max) return true
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return false
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const RESEND_TO_EMAIL = Deno.env.get('RESEND_TO_EMAIL')

    if (!RESEND_API_KEY || !RESEND_TO_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Configuración de email incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: 'Demasiados intentos. Esperá unos minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { nombre, email, mensaje } = await req.json()

    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    if (!isValidEmail(email.trim())) {
      return new Response(
        JSON.stringify({ error: 'El email no es válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    if (mensaje.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'El mensaje debe tener al menos 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const html = `
      <div style="font-family:'Courier New',monospace;max-width:480px;margin:0 auto;padding:32px;background:#fff;color:#000;">
        <div style="font-size:18px;letter-spacing:4px;text-transform:uppercase;margin-bottom:32px;font-weight:bold;">AVIX</div>
        <h2 style="font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;font-weight:normal;border-bottom:1px solid #000;padding-bottom:12px;">NUEVO MENSAJE DE CONTACTO</h2>
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">NOMBRE</p>
        <p style="font-size:13px;margin:0 0 20px;">${nombre.trim()}</p>
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">EMAIL</p>
        <p style="font-size:13px;margin:0 0 20px;">${email.trim()}</p>
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">MENSAJE</p>
        <p style="font-size:13px;line-height:1.7;margin:0;white-space:pre-wrap;">${mensaje.trim()}</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AVIX Contacto <onboarding@resend.dev>',
        to: [RESEND_TO_EMAIL],
        subject: `Nuevo mensaje de contacto - ${nombre.trim()}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
