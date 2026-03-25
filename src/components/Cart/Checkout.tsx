import { useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useCheckout } from '@/hooks/useCheckout'
import styles from './Checkout.module.css'

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY ?? '')

export function Checkout() {
  const { loading, error, startCheckout } = useCheckout()
  const [email, setEmail] = useState('')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    const id = await startCheckout(email)
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

      {error && (
        <div className={styles.error} data-testid="checkout-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
        data-testid="checkout-submit"
      >
        {loading ? 'PROCESANDO...' : 'CONTINUAR'}
      </button>
    </form>
  )
}
