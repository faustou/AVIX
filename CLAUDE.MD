Responder siempre en español. All responses must be in Spanish.

# AVIX — Instrucciones para Claude Code

## Qué es este proyecto
AVIX es un e-commerce mobile-first de ropa y accesorios con una UX 
minimalista. Toda la experiencia está diseñada para mobile (max-width 430px).
No existe versión desktop. El estilo visual es austero: fondo blanco, 
tipografía uppercase monospace, productos flotando sin contexto.

## Stack
- Frontend: React + Vite + TypeScript
- Estilos: CSS Modules (*.module.css por componente)
- Base de datos / auth / storage: Supabase
- Pagos: Mercado Pago (via API REST, sin backend propio — usando Edge Functions de Supabase si se necesita server-side)
- Deploy: Vercel

## Reglas absolutas
1. Este proyecto es SOLO mobile. Nunca agregues breakpoints desktop.
2. No uses Tailwind. Todo el CSS va en archivos .module.css del componente.
3. No hay páginas separadas para detalle de producto. Es un cambio de estado/vista dentro del mismo componente.
4. Las imágenes de productos siempre tienen fondo transparente o blanco — nunca pongas backgrounds de color detrás.
5. Toda la tipografía es uppercase, letter-spacing amplio, fuente monospace o condensada.
6. Nunca uses librerías de animación (framer-motion, gsap, etc.) — todo con CSS transitions y keyframes puros.
7. Antes de crear un componente nuevo, revisá si ya existe algo reutilizable en /src/components.

## Estructura de carpetas
```
src/
  components/
    Grid/           # ProductGrid + columnas variables
    ProductFeed/    # Vista detalle tipo TikTok
    SizePanel/      # Panel select size con animaciones
    Cart/           # Carrito y checkout
    Nav/            # Navbar categorías
  hooks/            # useCart, useProducts, useColumnCycle
  lib/
    supabase.ts     # Cliente Supabase
    mercadopago.ts  # Helpers MP
  types/
    index.ts        # Tipos TypeScript globales
  styles/
    globals.css     # Reset + variables CSS globales
docs/
.claude/
  skills/
```

## Variables CSS globales (globals.css)
```css
:root {
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-muted: #999999;
  --font-main: 'Courier New', Courier, monospace;
  --letter-spacing: 0.08em;
  --transition-fast: 150ms ease;
  --transition-slide: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Idioma
Responder siempre en español.