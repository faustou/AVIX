import styles from './CheckoutResult.module.css'

export function CheckoutSuccess() {
  return (
    <div className={styles.page} data-testid="checkout-success">
      <div className={styles.content}>
        <div className={styles.title}>PAGO CONFIRMADO</div>
        <div className={styles.message}>Tu pedido está en camino.</div>
        <a href="/" className={styles.btn}>
          VOLVER A LA TIENDA
        </a>
      </div>
    </div>
  )
}
