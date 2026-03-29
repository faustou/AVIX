import styles from './CategoryBar.module.css'

interface CategoryItem {
  id: string
  label: string
  soon?: boolean
}

const CATEGORIES: CategoryItem[] = [
  { id: 'joggings',     label: 'Joggings' },
  { id: 'musculosas',   label: 'Musculosas' },
  { id: 'remeras',      label: 'Remeras' },
  { id: 'camperas',     label: 'Camperas' },
  { id: 'gollerias',    label: 'Gollerías' },
  { id: 'proximamente', label: 'Próximamente', soon: true },
]

interface Props {
  active: string | null
  onChange: (id: string) => void
}

export function CategoryBar({ active, onChange }: Props) {
  return (
    <div className={styles.bar} aria-label="Categorías">
      <div className={styles.scroll}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.item} ${active === cat.id ? styles.itemActive : ''} ${cat.soon ? styles.itemSoon : ''}`}
            onClick={() => !cat.soon && onChange(cat.id)}
            disabled={cat.soon}
            data-testid={`category-${cat.id}`}
          >
            <span className={styles.circle}>
              {cat.soon ? '—' : cat.label[0]}
            </span>
            <span className={styles.label}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
