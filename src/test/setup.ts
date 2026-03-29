import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@mercadopago/sdk-react', () => ({
  initMercadoPago: vi.fn(),
  Wallet: () => null,
}))

// jsdom no implementa matchMedia — mock global para todos los tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})
