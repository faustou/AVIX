# AVIX — Skill de workflow para Claude Code

## Cómo encarar una nueva feature

1. **Leer el spec** en `docs/SPECS.md` para entender qué debe hacer exactamente
2. **Identificar el componente**: ¿existe ya en `/src/components`? Si existe, extenderlo. Si no, crear carpeta nueva con `Componente.tsx` + `Componente.module.css`
3. **Definir los tipos** necesarios en `src/types/index.ts` antes de escribir el componente
4. **Escribir el CSS primero** para animaciones complejas — las animaciones de AVIX son CSS puro, definir los keyframes y transitions antes de la lógica
5. **Implementar el componente** siguiendo las convenciones de abajo
6. **Conectar con Supabase** usando el cliente de `src/lib/supabase.ts` y los tipos generados
7. **Verificar en mobile** — abrir Chrome DevTools en modo mobile (iPhone SE o similar) antes de dar por terminado

## Cómo hacer un fix de bug

1. Reproducir el bug en mobile primero (no en desktop)
2. Verificar si el problema es de estado, de CSS, o de datos
3. Para bugs de animación: revisar si hay conflicto entre `transition` y `transform` en el `.module.css`
4. Para bugs de Supabase: verificar RLS policies y que el anon key tenga los permisos necesarios
5. No agregar workarounds sin entender la causa raíz

## Convenciones de componentes React/TSX
```tsx
// Estructura estándar de un componente AVIX
import styles from './NombreComponente.module.css'
import type { Producto } from '@/types'

interface Props {
  // Props explícitas con tipos, nunca `any`
}

export function NombreComponente({ prop1, prop2 }: Props) {
  // hooks primero
  // handlers después
  // return al final
  
  return (
    <div className={styles.container}>
      {/* Siempre className desde styles, nunca strings literales */}
    </div>
  )
}
```

- Siempre **named exports**, nunca default exports en componentes
- Props tipadas con `interface`, nunca inline
- Nunca usar `any` — si no sabés el tipo, usar `unknown` y narrowing
- Nombres de clases CSS en **camelCase** dentro del module (`.container`, `.productGrid`, `.sizePanel`)
- Toda la tipografía en el CSS: `text-transform: uppercase`, `letter-spacing: var(--letter-spacing)`

## Animaciones — reglas específicas de AVIX
```css
/* Patrón para slide-up de elementos */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Patrón para stagger en lista de talles */
.size:nth-child(1) { animation-delay: 0ms; }
.size:nth-child(2) { animation-delay: 30ms; }
/* etc. */

/* Transformación de + a × */
.plusButton {
  transition: transform var(--transition-slide);
}
.plusButton.open {
  transform: translate(4px, -4px) rotate(45deg);
}
```

- **Nunca** usar `framer-motion`, `gsap`, o cualquier librería de animación
- Usar `var(--transition-fast)` para hover states, `var(--transition-slide)` para paneles
- El scroll entre productos usa CSS nativo: `scroll-snap-type: y mandatory` en el contenedor y `scroll-snap-align: start` en cada item

## Cómo interactuar con Supabase
```typescript
// src/lib/supabase.ts — cliente único
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // tipos generados con supabase gen types

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Fetch de productos — patrón estándar
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_images(storage_path, position),
    product_sizes(size_us, size_eu, in_stock)
  `)
  .eq('category_slug', categoriaActiva)
  .order('created_at', { ascending: false })
```

- **RLS**: todas las tablas tienen RLS activo. Anon key solo puede SELECT en products, product_images, product_sizes. INSERT en orders y order_items.
- **Storage**: las URLs de imágenes se obtienen con `supabase.storage.from('product-images').getPublicUrl(path)`
- **Edge Functions**: el cliente las llama con `supabase.functions.invoke('nombre-funcion', { body: payload })`
- Nunca exponer `MP_ACCESS_TOKEN` en el cliente — solo se usa en Edge Functions

## Testing

### Stack
- **Vitest** + **React Testing Library** + **jsdom**
- UI interactivo: `npm run test:ui`
- CI / verificación final: `npm run test:run`

### Dónde van los tests
- Hook nuevo → `src/hooks/useNombre.test.ts` (misma carpeta)
- Componente nuevo → `src/components/Nombre/Nombre.test.tsx` (misma carpeta)
- Util / helper → archivo `.test.ts` al lado del archivo fuente

### Tipos de test
- **Unit**: hooks, utils, cálculos puros (ej: `useColumnCycle`, totales de `useCart`)
- **Component**: render correcto, interacciones con `userEvent` (ej: abrir SizePanel, cambiar columnas)
- **Integration**: flujos completos end-to-end con mocks de Supabase (ej: agregar producto → ver carrito → total correcto)

### Modelo a seguir para hooks: `useColumnCycle`
```typescript
import { renderHook, act } from '@testing-library/react'
import { useNombre } from './useNombre'

describe('useNombre', () => {
  it('estado inicial correcto', () => {
    const { result } = renderHook(() => useNombre())
    expect(result.current.valor).toBe(esperado)
  })

  it('descripción de la acción y resultado', () => {
    const { result } = renderHook(() => useNombre())
    act(() => result.current.accion())
    expect(result.current.valor).toBe(nuevoEsperado)
  })
})
```

### Mocks de Supabase
Los mocks van en `src/test/mocks/supabase.ts` y se importan en los tests de integración.
Nunca mockear lo que se puede testear real.

```typescript
// src/test/mocks/supabase.ts
import { vi } from 'vitest'

export const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))
```

### Patrones y decisiones conocidas

#### IntersectionObserver
Mockear con clase, no arrow function. El mock con arrow function falla silenciosamente como constructor.

Correcto:
```typescript
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(cb: IntersectionObserverCallback) { capturedIOCallback = cb }
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
```

Incorrecto (falla silenciosamente como constructor):
```typescript
vi.fn().mockImplementation(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }))
```

#### Estado activo en CSS Modules
Usar data attributes en lugar de clases condicionales para estilos de estado (activo, abierto, deshabilitado).

Correcto:
```tsx
<button data-active={isActive.toString()}>
// CSS: .button[data-active='true'] { color: black; }
```

Incorrecto (los class names hasheados rompen los tests):
```tsx
<button className={isActive ? styles.active : ''}>
```

Aplicar en: Nav categorías, SizePanel estado abierto, botones de talla seleccionada, columnas activas del grid.

#### Patrón Capture para tests de Context
Cuando un test necesita pre-popular un Context (ej: agregar items al carrito antes de renderizar el componente a testear), usar un componente Capture interno que expone las funciones del context hacia afuera via ref o closure.

```tsx
let capturedAddItem: Function
function Capture() {
  const { addItem } = useCart()
  capturedAddItem = addItem
  return null
}
render(<CartProvider><Capture /><ComponenteATestear /></CartProvider>)
act(() => capturedAddItem(mockProduct, 'M'))
```

Evita wrappers complejos y renders adicionales.

### Cobertura objetivo
Máxima posible. Toda la lógica de negocio (hooks, utils) debe tener cobertura completa.

### Regla de cierre de tarea
`npm run test:run` debe pasar al 100% antes de dar cualquier tarea por terminada.

## Checklist antes de dar una tarea por terminada

- [ ] El componente se ve correctamente en mobile (375px y 430px de ancho)
- [ ] No hay elementos que se corten o hagan scroll horizontal indeseado
- [ ] Las animaciones funcionan en Chrome mobile (no solo en desktop)
- [ ] Los datos vienen de Supabase (no hay datos hardcodeados que deban ser dinámicos)
- [ ] No hay `console.log` olvidados
- [ ] Los tipos TypeScript están definidos (no hay `any`)
- [ ] El CSS usa variables de `globals.css` en lugar de valores hardcodeados
- [ ] Si se agregó una tabla o Edge Function nueva, está documentada en `ARCHITECTURE.md`
- [ ] `npm run test:run` pasa al 100%