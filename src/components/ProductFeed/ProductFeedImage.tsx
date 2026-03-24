import { useEffect, useRef, useState } from 'react'
import styles from './ProductFeedImage.module.css'
import { useSwipe } from '@/hooks/useSwipe'
import type { ProductImage } from '@/types'

type AnimationState = 'idle' | 'exit-up' | 'exit-down' | 'enter-up' | 'enter-down'

interface Props {
  images: ProductImage[]
  animationState: AnimationState
  onAnimationEnd: () => void
}

export function ProductFeedImage({ images, animationState, onAnimationEnd }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const sortedImages = [...images].sort((a, b) => a.position - b.position)

  // Use native addEventListener so tests can trigger via dispatchEvent
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.addEventListener('animationend', onAnimationEnd)
    return () => el.removeEventListener('animationend', onAnimationEnd)
  }, [onAnimationEnd])

  function handleCarouselScroll() {
    const el = carouselRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveImageIndex(index)
  }

  const swipeHandlers = useSwipe(
    () => {
      const el = carouselRef.current
      if (!el || activeImageIndex >= sortedImages.length - 1) return
      el.scrollTo({ left: el.clientWidth * (activeImageIndex + 1), behavior: 'smooth' })
    },
    () => {
      const el = carouselRef.current
      if (!el || activeImageIndex <= 0) return
      el.scrollTo({ left: el.clientWidth * (activeImageIndex - 1), behavior: 'smooth' })
    },
  )

  return (
    <div className={styles.imageZone}>
      <div
        ref={wrapperRef}
        className={styles.animationWrapper}
        data-animation={animationState}
        data-testid="image-animation-wrapper"
      >
        <div
          ref={carouselRef}
          className={styles.carousel}
          onScroll={handleCarouselScroll}
          data-testid="carousel"
          {...swipeHandlers}
        >
          {sortedImages.map((img) => (
            <img
              key={img.id}
              src={img.storage_path}
              alt=""
              className={styles.carouselImage}
            />
          ))}
        </div>
      </div>

      {sortedImages.length > 1 && (
        <div className={styles.dots} aria-hidden="true" data-testid="dots">
          {sortedImages.map((img, i) => (
            <span
              key={img.id}
              className={styles.dot}
              data-active={i === activeImageIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
