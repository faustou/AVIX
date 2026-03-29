import { useEffect, useRef, useState } from 'react'
import type { WheelEvent } from 'react'
import styles from './ProductFeedImage.module.css'
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

  function getImageWidth(carousel: HTMLDivElement): number {
    return (carousel.children[0] as HTMLElement)?.clientWidth ?? carousel.clientWidth
  }

  function handleCarouselScroll() {
    const el = carouselRef.current
    if (!el) return
    const imageWidth = getImageWidth(el)
    const index = Math.round(el.scrollLeft / imageWidth)
    setActiveImageIndex(index)
  }

  const wheelBlocked = useRef(false)

  function scrollToImage(index: number) {
    const el = carouselRef.current
    if (!el) return
    const imageWidth = getImageWidth(el)
    el.scrollTo({ left: imageWidth * index, behavior: 'smooth' })
  }

  function handleCarouselWheel(e: WheelEvent) {
    const el = carouselRef.current
    if (!el || sortedImages.length <= 1) return

    const imageWidth = getImageWidth(el)
    const hasOverflow = imageWidth * sortedImages.length > el.clientWidth
    if (!hasOverflow) return

    e.stopPropagation()

    if (wheelBlocked.current) return
    if (Math.abs(e.deltaY) < 30) return

    wheelBlocked.current = true
    setTimeout(() => { wheelBlocked.current = false }, 600)

    if (e.deltaY > 0 && activeImageIndex < sortedImages.length - 1) {
      scrollToImage(activeImageIndex + 1)
    } else if (e.deltaY < 0 && activeImageIndex > 0) {
      scrollToImage(activeImageIndex - 1)
    }
  }

  const canPrev = activeImageIndex > 0
  const canNext = activeImageIndex < sortedImages.length - 1

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
          onWheel={handleCarouselWheel}
          data-testid="carousel"
        >
          {sortedImages.map((img) => (
            <img
              key={img.id}
              src={img.storage_path}
              alt=""
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              className={styles.carouselImage}
            />
          ))}
        </div>

        {sortedImages.length > 1 && (
          <>
            <button
              className={`${styles.navArrow} ${styles.navArrowPrev}`}
              onClick={() => scrollToImage(activeImageIndex - 1)}
              disabled={!canPrev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              className={`${styles.navArrow} ${styles.navArrowNext}`}
              onClick={() => scrollToImage(activeImageIndex + 1)}
              disabled={!canNext}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
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
