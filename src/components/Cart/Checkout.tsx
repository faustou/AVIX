import { useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useCheckout } from '@/hooks/useCheckout'
import { useCart } from '@/hooks/useCart'
import { ShippingCalculator } from './ShippingCalculator'
import type { ShippingAddress, ShippingOption } from '@/types'
import styles from './Checkout.module.css'

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY ?? '')

const EMPTY_ADDRESS: ShippingAddress = {
  nombre: '',
  apellido: '',
  calle: '',
  numero: '',
  piso: '',
  depto: '',
  cp: '',
  localidad: '',
  provincia: '',
}

interface Props {
  onShippingCostChange?: (cost: number) => void
}

export function Checkout({ onShippingCostChange }: Props) {
  const { loading, error, startCheckout } = useCheckout()
  const { items } = useCart()
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  function setField(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function handleShippingSelect(option: ShippingOption) {
    setSelectedShipping(option)
    onShippingCostChange?.(option.valor)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !selectedShipping) return
    const id = await startCheckout({
      email,
      shippingAddress: address,
      shippingOption: selectedShipping,
    })
    if (id) setPreferenceId(id)
  }

  if (preferenceId) {
    return (
      <div className={styles.brickContainer} data-testid="mp-brick">
        <Wallet initialization={{ preferenceId }} />
        <div className={styles.secureText}>PAGA DE FORMA SEGURA</div>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} data-testid="checkout-form">

      {/* DATOS DE CONTACTO */}
      <div className={styles.sectionTitle}>DATOS DE CONTACTO</div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="checkout-email">
          EMAIL
        </label>
        <input
          id="checkout-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="checkout-email"
          required
        />
      </div>

      {/* DIRECCIÓN DE ENVÍO */}
      <div className={styles.sectionTitle}>DIRECCIÓN DE ENVÍO</div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="addr-nombre">NOMBRE</label>
          <input
            id="addr-nombre"
            className={styles.input}
            type="text"
            value={address.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="addr-apellido">APELLIDO</label>
          <input
            id="addr-apellido"
            className={styles.input}
            type="text"
            value={address.apellido}
            onChange={(e) => setField('apellido', e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
          <label className={styles.label} htmlFor="addr-calle">CALLE</label>
          <input
            id="addr-calle"
            className={styles.input}
            type="text"
            value={address.calle}
            onChange={(e) => setField('calle', e.target.value)}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="addr-numero">NÚM.</label>
          <input
            id="addr-numero"
            className={styles.input}
            type="text"
            value={address.numero}
            onChange={(e) => setField('numero', e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="addr-piso">PISO</label>
          <input
            id="addr-piso"
            className={styles.input}
            type="text"
            placeholder="—"
            value={address.piso}
            onChange={(e) => setField('piso', e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="addr-depto">DEPTO</label>
          <input
            id="addr-depto"
            className={styles.input}
            type="text"
            placeholder="—"
            value={address.depto}
            onChange={(e) => setField('depto', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="addr-localidad">LOCALIDAD</label>
        <input
          id="addr-localidad"
          className={styles.input}
          type="text"
          value={address.localidad}
          onChange={(e) => setField('localidad', e.target.value)}
          required
        />
      </div>

      {/* CALCULADORA DE ENVÍO */}
      <ShippingCalculator
        onShippingSelect={handleShippingSelect}
        onCalculate={(cp, provincia) => {
          setField('cp', cp)
          setField('provincia', provincia)
        }}
        cartItems={items.map((i) => ({ peso: i.product.peso }))}
        initialCp={address.cp}
        initialProvincia={address.provincia}
      />

      {!selectedShipping && (
        <div className={styles.shippingHint}>SELECCIONÁ UNA OPCIÓN DE ENVÍO PARA CONTINUAR</div>
      )}

      {error && (
        <div className={styles.error} data-testid="checkout-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading || !selectedShipping}
        data-testid="checkout-submit"
      >
        {loading ? 'PROCESANDO...' : 'CONTINUAR AL PAGO'}
      </button>
    </form>
  )
}
