import { useState } from 'react'
import type { ShippingOption } from '@/types'
import styles from './ShippingCalculator.module.css'

const PROVINCIAS = [
  { code: 'A', name: 'Salta' },
  { code: 'B', name: 'Buenos Aires' },
  { code: 'C', name: 'Ciudad Autónoma de Buenos Aires' },
  { code: 'D', name: 'San Luis' },
  { code: 'E', name: 'Entre Ríos' },
  { code: 'F', name: 'La Rioja' },
  { code: 'G', name: 'Santiago del Estero' },
  { code: 'H', name: 'Chaco' },
  { code: 'J', name: 'San Juan' },
  { code: 'K', name: 'Catamarca' },
  { code: 'L', name: 'La Pampa' },
  { code: 'M', name: 'Mendoza' },
  { code: 'N', name: 'Misiones' },
  { code: 'P', name: 'Formosa' },
  { code: 'Q', name: 'Neuquén' },
  { code: 'R', name: 'Río Negro' },
  { code: 'S', name: 'Santa Fe' },
  { code: 'T', name: 'Tucumán' },
  { code: 'U', name: 'Chubut' },
  { code: 'V', name: 'Tierra del Fuego' },
  { code: 'W', name: 'Corrientes' },
  { code: 'X', name: 'Córdoba' },
  { code: 'Y', name: 'Jujuy' },
  { code: 'Z', name: 'Santa Cruz' },
]

interface Props {
  onShippingSelect: (option: ShippingOption) => void
  cartItems: { peso?: number | null }[]
  initialCp?: string
  initialProvincia?: string
}

export function ShippingCalculator({
  onShippingSelect,
  cartItems,
  initialCp = '',
  initialProvincia = '',
}: Props) {
  const [cp, setCp] = useState(initialCp)
  const [provincia, setProvincia] = useState(initialProvincia)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCalculate() {
    if (cp.length < 4 || !provincia) return
    setLoading(true)
    setError(null)
    setOptions([])
    setSelectedId(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote-shipping`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            codigo_postal: cp,
            provincia,
            items: cartItems.map((i) => ({ peso: i.peso ?? 0.5 })),
          }),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }

      const data: ShippingOption[] = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        setError('No hay opciones de envío disponibles para ese código postal')
        return
      }

      setOptions(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(option: ShippingOption) {
    setSelectedId(option.correo_id)
    onShippingSelect(option)
  }

  const canCalculate = cp.length >= 4 && !!provincia && !loading

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>CALCULAR ENVÍO</div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="ship-cp">
            COD. POSTAL
          </label>
          <input
            id="ship-cp"
            className={styles.input}
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder="1414"
            value={cp}
            onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
          <label className={styles.label} htmlFor="ship-provincia">
            PROVINCIA
          </label>
          <select
            id="ship-provincia"
            className={styles.select}
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          >
            <option value="">—</option>
            {PROVINCIAS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className={styles.calcBtn}
        type="button"
        onClick={handleCalculate}
        disabled={!canCalculate}
      >
        {loading ? 'CALCULANDO...' : 'CALCULAR ENVÍO'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {options.length > 0 && (
        <div className={styles.options}>
          {options.map((opt) => (
            <button
              key={opt.correo_id}
              type="button"
              className={`${styles.optionCard} ${selectedId === opt.correo_id ? styles.selected : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <div className={styles.optionTop}>
                <span className={styles.optionName}>{opt.correo_nombre}</span>
                <span className={styles.optionPrice}>
                  ${opt.valor.toLocaleString('es-AR')}
                </span>
              </div>
              {(opt.horas_entrega || opt.fecha_estimada) && (
                <div className={styles.optionEta}>
                  {opt.horas_entrega
                    ? `${Math.ceil(opt.horas_entrega / 24)} DÍAS HÁBILES`
                    : ''}
                  {opt.fecha_estimada ? ` — ${opt.fecha_estimada}` : ''}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
