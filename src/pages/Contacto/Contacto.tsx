import { useState } from 'react'
import styles from './Contacto.module.css'

// TODO: reemplazar con datos reales
const WA_NUMBER = '5491100000000'
const IG_HANDLE = 'avix.arg'
const CONTACT_EMAIL = 'hola@avix.ar'

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
  if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim())
    return 'Todos los campos son requeridos'
  if (!isValidEmail(form.email.trim()))
    return 'El email no es válido'
  if (form.mensaje.trim().length < 10)
    return 'El mensaje debe tener al menos 10 caracteres'
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
    if (validationError) { setError(validationError); return }
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
      if (!res.ok) { setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.'); return }
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

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}>AVIX STUDIO</span>
        <h1 className={styles.heroTitle}>CONTACTO</h1>
        <p className={styles.heroSub}>
          ESTAMOS PARA AYUDARTE.<br />
          RESPONDEMOS TODOS LOS MENSAJES.
        </p>
      </div>

      {/* ── Canales rápidos ── */}
      <div className={styles.channels}>
        <a
          className={styles.channel}
          href={`https://wa.me/${WA_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.channelIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className={styles.channelInfo}>
            <span className={styles.channelLabel}>WHATSAPP</span>
            <span className={styles.channelDetail}>RESPUESTA INMEDIATA</span>
          </div>
          <span className={styles.channelArrow}>→</span>
        </a>

        <a
          className={styles.channel}
          href={`https://instagram.com/${IG_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.channelIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div className={styles.channelInfo}>
            <span className={styles.channelLabel}>INSTAGRAM</span>
            <span className={styles.channelDetail}>@{IG_HANDLE}</span>
          </div>
          <span className={styles.channelArrow}>→</span>
        </a>

        <a
          className={styles.channel}
          href={`mailto:${CONTACT_EMAIL}`}
        >
          <div className={styles.channelIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
          </div>
          <div className={styles.channelInfo}>
            <span className={styles.channelLabel}>EMAIL</span>
            <span className={styles.channelDetail}>{CONTACT_EMAIL}</span>
          </div>
          <span className={styles.channelArrow}>→</span>
        </a>
      </div>

      {/* ── Horario ── */}
      <div className={styles.hours}>
        <div className={styles.hoursRow}>
          <span className={styles.hoursDay}>LUN — VIE</span>
          <span className={styles.hoursTime}>10:00 — 18:00</span>
        </div>
        <div className={styles.hoursRow}>
          <span className={styles.hoursDay}>SÁB</span>
          <span className={styles.hoursTime}>10:00 — 14:00</span>
        </div>
        <div className={styles.hoursRow}>
          <span className={styles.hoursDay}>DOM</span>
          <span className={styles.hoursTime} style={{ color: 'var(--color-muted)' }}>CERRADO</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>O ENVIANOS UN MENSAJE</span>
        <span className={styles.dividerLine} />
      </div>

      {/* ── Formulario ── */}
      <div className={styles.formSection}>
        <p className={styles.formTitle}>ENVIANOS UN MENSAJE</p>
        {success ? (
          <div className={styles.successBox} data-testid="contact-success">
            <div className={styles.successIcon}>✓</div>
            <span className={styles.successText}>¡MENSAJE ENVIADO!</span>
            <span className={styles.successSub}>TE RESPONDEMOS A LA BREVEDAD</span>
            <button className={styles.backBtn} onClick={() => setSuccess(false)}>
              ENVIAR OTRO MENSAJE
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="contact-nombre">NOMBRE COMPLETO</label>
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
              <label className={styles.label} htmlFor="contact-email">EMAIL</label>
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
              <label className={styles.label} htmlFor="contact-mensaje">MENSAJE</label>
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
              <div className={styles.error} data-testid="contact-error">{error}</div>
            )}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              data-testid="contact-submit"
            >
              {loading ? <span className={styles.spinner} aria-label="Enviando" /> : 'ENVIAR MENSAJE'}
            </button>
          </form>
        )}
      </div>

    </div>
  )
}
