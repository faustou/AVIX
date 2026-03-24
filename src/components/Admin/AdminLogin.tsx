import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AdminLogin.module.css'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export function AdminLogin() {
  const { signIn } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const err = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError(err)
    } else {
      navigate('/admin/productos')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.title}>AVIX ADMIN</h1>
        <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
          <input
            className={styles.input}
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="email-input"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="password-input"
          />
          {error && (
            <p className={styles.error} data-testid="error-message">
              {error}
            </p>
          )}
          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
            data-testid="submit-button"
          >
            {submitting ? '...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
