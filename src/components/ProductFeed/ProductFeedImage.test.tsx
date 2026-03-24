import { render, screen } from '@testing-library/react'
import { ProductFeedImage } from './ProductFeedImage'
import { mockProducts } from '@/test/mocks/products'

const images2 = mockProducts[0].product_images // YS-01: 2 images
const images3 = mockProducts[1].product_images // PK-01: 3 images

function renderImage(overrides: Partial<Parameters<typeof ProductFeedImage>[0]> = {}) {
  const props = {
    images: images2,
    animationState: 'idle' as const,
    onAnimationEnd: vi.fn(),
    ...overrides,
  }
  render(<ProductFeedImage {...props} />)
  return props
}

describe('ProductFeedImage', () => {
  it('renderiza la primera imagen por defecto', () => {
    renderImage()
    const sorted = [...images2].sort((a, b) => a.position - b.position)
    const carousel = screen.getByTestId('carousel')
    const imgs = carousel.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThanOrEqual(1)
    expect(imgs[0]).toHaveAttribute('src', sorted[0].storage_path)
  })

  it('los dots reflejan la cantidad de imágenes (2 dots para 2 imágenes)', () => {
    renderImage({ images: images2 })
    const dots = screen.getByTestId('dots').querySelectorAll('span')
    expect(dots).toHaveLength(2)
  })

  it('los dots reflejan la cantidad de imágenes (3 dots para 3 imágenes)', () => {
    renderImage({ images: images3 })
    const dots = screen.getByTestId('dots').querySelectorAll('span')
    expect(dots).toHaveLength(3)
  })

  it('no muestra dots si el producto tiene solo 1 imagen', () => {
    renderImage({ images: [images2[0]] })
    expect(screen.queryByTestId('dots')).not.toBeInTheDocument()
  })

  it('aplica data-animation correcto al wrapper', () => {
    renderImage({ animationState: 'exit-up' })
    expect(screen.getByTestId('image-animation-wrapper')).toHaveAttribute('data-animation', 'exit-up')
  })

  it('llama onAnimationEnd cuando termina la animación', () => {
    const onAnimationEnd = vi.fn()
    renderImage({ onAnimationEnd })
    const wrapper = screen.getByTestId('image-animation-wrapper')
    wrapper.dispatchEvent(new Event('animationend'))
    expect(onAnimationEnd).toHaveBeenCalledOnce()
  })
})
