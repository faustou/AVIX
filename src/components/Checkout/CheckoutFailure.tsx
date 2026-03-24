import styles from './CheckoutResult.module.css'

export function CheckoutFailure() {
  return (
    <div className={styles.page} data-testid="checkout-failure">
      <div className={styles.content}>
        <div className={styles.title}>PAGO FALLIDO</div>
        <div className={styles.message}>
          Hubo un problema con tu pago. Intentá de nuevo.
        </div>
        <a href="/" className={styles.btn}>
          VOLVER AL CARRITO
        </a>
      </div>
    </div>
  )
}
