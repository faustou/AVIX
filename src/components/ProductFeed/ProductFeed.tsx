import { useState } from 'react'
import styles from './ProductFeed.module.css'
import { ProductFeedImage } from './ProductFeedImage'
import { ProductFeedInfo } from './ProductFeedInfo'
import { useSwipe } from '@/hooks/useSwipe'
import type { Product } from '@/types'

type AnimationState = 'idle' | 'exit-up' | 'exit-down' | 'enter-up' | 'enter-down'

interface Props {
  products: Product[]
  initialIndex: number
  onAddToCart: (product: Product, size: string) => void
  onClose: () => void
}

export function ProductFeed({ products, initialIndex, onAddToCart }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [displayIndex, setDisplayIndex] = useState(initialIndex)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')

  function goNext() {
    if (activeIndex >= products.length - 1) return
    setActiveIndex((i) => i + 1)
    setAnimationState('exit-up')
  }

  function goPrev() {
    if (activeIndex <= 0) return
    setActiveIndex((i) => i - 1)
    setAnimationState('exit-down')
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

  const swipeHandlers = useSwipe(goNext, goPrev)

  return (
    <div
      className={styles.container}
      data-testid="product-feed"
      {...swipeHandlers}
    >
      <ProductFeedImage
        images={products[displayIndex].product_images}
        animationState={animationState}
        onAnimationEnd={handleAnimationEnd}
      />
      <ProductFeedInfo
        product={products[displayIndex]}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
