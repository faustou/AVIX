import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@mercadopago/sdk-react', () => ({
  initMercadoPago: vi.fn(),
  Wallet: () => null,
}))
