import { useState } from 'react'
import styles from './Contacto.module.css'

interface FormState {
  nombre: string
  email: string
  mensaje: string
}

const EMPTY: FormState = { nombre: '', email: '', mensaje: '' }

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(form: FormState): string | null {
  if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
    return 'Todos los campos son requeridos'
  }
  if (!isValidEmail(form.email.trim())) {
    return 'El email no es válido'
  }
  if (form.mensaje.trim().length < 10) {
    return 'El mensaje debe tener al menos 10 caracteres'
  }
  return null
}

export function Contacto() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationError = validate(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            email: form.email.trim(),
            mensaje: form.mensaje.trim(),
          }),
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      setSuccess(true)
      setForm(EMPTY)
    } catch {
      setError('No pudimos enviar el mensaje. Revisá tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>CONTACTO</h1>
        <p className={styles.subtitle}>ESCRIBINOS Y TE RESPONDEMOS A LA BREVEDAD</p>

        {success ? (
          <div className={styles.successBox} data-testid="contact-success">
            <span className={styles.successText}>¡MENSAJE ENVIADO!</span>
            <span className={styles.successSub}>TE RESPONDEMOS PRONTO</span>
            <button
              className={styles.backBtn}
              onClick={() => setSuccess(false)}
            >
              ENVIAR OTRO
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="contact-nombre">
                NOMBRE COMPLETO
              </label>
              <input
                id="contact-nombre"
                className={styles.input}
                type="text"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="contact-email">
                EMAIL
              </label>
              <input
                id="contact-email"
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="contact-mensaje">
                MENSAJE
              </label>
              <textarea
                id="contact-mensaje"
                className={styles.textarea}
                value={form.mensaje}
                onChange={(e) => setField('mensaje', e.target.value)}
                rows={4}
                required
              />
            </div>

            {error && (
              <div className={styles.error} data-testid="contact-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              data-testid="contact-submit"
            >
              {loading ? (
                <span className={styles.spinner} aria-label="Enviando" />
              ) : (
                'ENVIAR MENSAJE'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
