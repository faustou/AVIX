import styles from './CycleIcon.module.css'

interface CycleIconProps {
  direction: 'in' | 'out'
}

// Transforms expressed as translate(cx,cy) rotate(θ) translate(-cx,-cy)
// so the pivot is encoded in the transform list itself — no transformOrigin changes.
const LINE1 = {
  in:  'rotate(0deg)',
  out: 'translate(5px, 12px) rotate(-35deg) translate(-5px, -12px)',
}

const LINE2 = {
  in:  'translate(12px, 12px) rotate(90deg) translate(-12px, -12px)',
  out: 'translate(5px, 12px) rotate(35deg) translate(-5px, -12px)',
}

export function CycleIcon({ direction }: CycleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      data-testid="cycle-icon"
    >
      <line
        className={styles.line}
        x1="5" y1="12" x2="19" y2="12"
        style={{ transform: LINE1[direction], transformBox: 'view-box' }}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        data-testid="cycle-line-1"
      />
      <line
        className={styles.line}
        x1="5" y1="12" x2="19" y2="12"
        style={{ transform: LINE2[direction], transformBox: 'view-box' }}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        data-testid="cycle-line-2"
      />
    </svg>
  )
}
