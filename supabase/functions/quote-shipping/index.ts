import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuoteItem {
  peso?: number
}

interface RequestBody {
  codigo_postal: string
  provincia: string
  items: QuoteItem[]
}

async function getEnvioPackToken(): Promise<string> {
  const apiKey = Deno.env.get('ENVIOPACK_API_KEY')
  const secretKey = Deno.env.get('ENVIOPACK_SECRET_KEY')

  if (!apiKey || !secretKey) {
    throw new Error('Credenciales EnvioPack no configuradas')
  }

  const body = new URLSearchParams({
    'api-key': apiKey,
    'secret-key': secretKey,
  })

  const res = await fetch('https://api.enviopack.com/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`EnvioPack auth error ${res.status}: ${txt}`)
  }

  const data = await res.json()
  // La API devuelve el token en el campo "token" (no "access_token")
  if (!data.token) throw new Error('EnvioPack auth: token ausente en la respuesta')
  return data.token as string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { codigo_postal, provincia, items }: RequestBody = await req.json()

    if (!codigo_postal || !provincia || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros: codigo_postal, provincia, items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Calcular peso total (default 0.5kg por item)
    const pesoTotal = Math.max(0.5, items.reduce((acc, item) => acc + (item.peso ?? 0.5), 0))

    const depositId = Deno.env.get('ENVIOPACK_DEPOSIT_ID')
    if (!depositId) {
      return new Response(
        JSON.stringify({ error: 'ENVIOPACK_DEPOSIT_ID no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const token = await getEnvioPackToken()

    const url = new URL('https://api.enviopack.com/cotizar/costo')
    url.searchParams.set('access_token', token)
    url.searchParams.set('provincia', provincia)
    url.searchParams.set('codigo_postal', codigo_postal)
    url.searchParams.set('peso', String(pesoTotal))
    url.searchParams.set('direccion_envio', depositId)

    console.log('QUOTE URL:', url.toString())
    const res = await fetch(url.toString())

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`EnvioPack cotización error ${res.status}: ${errText}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json()
    console.log('QUOTE RAW RESPONSE:', JSON.stringify(raw))

    // Solo modalidad D (domicilio) — sucursal requiere sucursal_id adicional
    const seen = new Set<string>()
    const options = (Array.isArray(raw) ? raw : [])
      .filter((item: any) => item.modalidad === 'D')
      .filter((item: any) => {
        const key = String(item.correo?.id ?? '')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((item: any) => ({
        correo_id: item.correo?.id ?? 0,
        correo_nombre: item.correo?.nombre ?? '',
        valor: item.valor,
        horas_entrega: item.horas_entrega ?? null,
        fecha_estimada: item.fecha_estimada ?? null,
        modalidad: item.modalidad ?? 'D',
      }))

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
