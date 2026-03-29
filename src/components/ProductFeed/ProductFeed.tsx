import { useState, useRef } from 'react'
import type { WheelEvent } from 'react'
import styles from './ProductFeed.module.css'
import { ProductFeedImage } from './ProductFeedImage'
import { ProductFeedInfo } from './ProductFeedInfo'
import type { Product } from '@/types'

type AnimationState = 'idle' | 'exit-up' | 'exit-down' | 'enter-up' | 'enter-down'

interface Props {
  products: Product[]
  initialIndex: number
  onAddToCart: (product: Product, size: string) => void
  onClose: () => void
  onProductChange?: (index: number) => void
}

export function ProductFeed({ products, initialIndex, onAddToCart, onProductChange }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [displayIndex, setDisplayIndex] = useState(initialIndex)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')

  function goNext() {
    if (activeIndex >= products.length - 1) return
    const next = activeIndex + 1
    setActiveIndex(next)
    setAnimationState('exit-up')
    onProductChange?.(next)
  }

  function goPrev() {
    if (activeIndex <= 0) return
    const next = activeIndex - 1
    setActiveIndex(next)
    setAnimationState('exit-down')
    onProductChange?.(next)
  }

  function handleAnimationEnd() {
    if (animationState === 'exit-up') {
      setDisplayIndex(activeIndex)
      setAnimationState('enter-down')
    } else if (animationState === 'exit-down') {
      setDisplayIndex(activeIndex)
      setAnimationState('enter-up')
    } else {
      setAnimationState('idle')
    }
  }

  const wheelBlocked = useRef(false)

  function handleWheel(e: WheelEvent) {
    if (Math.abs(e.deltaY) < 30) return
    if (wheelBlocked.current) return
    wheelBlocked.current = true
    setTimeout(() => { wheelBlocked.current = false }, 700)
    if (e.deltaY > 0) goNext()
    else goPrev()
  }

  return (
    <div
      className={styles.container}
      data-testid="product-feed"
      onWheel={handleWheel}
    >
      <ProductFeedImage
        images={products[displayIndex].product_images}
        animationState={animationState}
        onAnimationEnd={handleAnimationEnd}
        onSwipeNext={goNext}
        onSwipePrev={goPrev}
      />
      <ProductFeedInfo
        product={products[displayIndex]}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
