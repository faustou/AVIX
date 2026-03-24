# AVIX — Roadmap

## Fase 0 — Setup inicial
- [ ] Crear repo GitHub con estructura de carpetas definida en CLAUDE.md
- [ ] Inicializar proyecto Vite + React + TypeScript
- [ ] Configurar CSS Modules (ya incluido en Vite, verificar)
- [ ] Crear proyecto en Supabase, copiar URL y anon key
- [ ] Crear archivo `.env.local` con variables de entorno
- [ ] Configurar cliente Supabase en `src/lib/supabase.ts`
- [ ] Crear tablas en Supabase (ver ARCHITECTURE.md para el schema SQL)
- [ ] Subir imágenes de productos de prueba a Supabase Storage
- [ ] Deploy base en Vercel con env vars configuradas
- [ ] Verificar que el proyecto carga en mobile (Chrome DevTools + dispositivo real)

## Fase 1 — MVP core

### Grid de productos
- [ ] Componente `ProductGrid` con layout de 3 columnas por defecto
- [ ] Hook `useColumnCycle` — cicla 3→2→1→2→3 progresivamente
- [ ] Botón `+` en header que llama al hook
- [ ] Fetch de productos desde Supabase con filtro por categoría
- [ ] Navbar con filtros: NEW / MENS / WOMENS / SLIDES / ACCESSORIES
- [ ] Estado activo en navbar con tipografía diferenciada (bold vs muted)

### Vista de detalle (feed vertical)
- [ ] Componente `ProductFeed` — lista vertical de productos con scroll snapping
- [ ] CSS scroll-snap para el comportamiento tipo TikTok
- [ ] Al tocar un producto en el grid, el feed se abre posicionado en ese producto
- [ ] Carrusel horizontal de imágenes por producto con dots indicadores
- [ ] Muestra: nombre, precio, botón `+`

### Panel de tallas
- [ ] Componente `SizePanel` que aparece al tocar `+`
- [ ] Animación: `+` transiciona a `×` (translate + rotate CSS)
- [ ] Talles aparecen con stagger slide-up
- [ ] Toggle `?` alterna entre sistema de tallas del producto (US/EU o número/letra)
- [ ] Estado "ADDING" al seleccionar talla (300ms) → cierra panel
- [ ] Sección INFORMATION expandible con slide-up/down

### Carrito
- [ ] Hook `useCart` con estado global (Context o Zustand)
- [ ] Contador de items en el ícono del carrito (top-right)
- [ ] Vista de carrito: order summary con producto, talla, qty (+/−), precio
- [ ] Cálculo de subtotal y total en tiempo real
- [ ] Botón para proceder al checkout

### Checkout
- [ ] Integración Mercado Pago — crear preferencia de pago
- [ ] Redirect a MP Checkout o uso de Brick embebido (a decidir según UX)
- [ ] Formulario de contacto: email address, dirección de envío
- [ ] Footer con links: CONTACT · TERMS · PRIVACY · ACCESSIBILITY · DNSMPI · COOKIES

### Panel Admin — Auth
- [ ] Configurar Supabase Auth para admins (email/password)
- [ ] Crear tabla admins en Supabase
- [ ] Ruta /admin con guard: redirige a /admin/login si no autenticado
- [ ] Página /admin/login con formulario email/password
- [ ] Logout

### Panel Admin — Productos
- [ ] Layout base del admin (sidebar o tabs: Productos / Pedidos)
- [ ] /admin/productos — lista de productos con estado publicado/despublicado
- [ ] /admin/productos/nuevo — formulario completo de creación
- [ ] Subida de imágenes a Supabase Storage con preview
- [ ] Reordenamiento de imágenes (drag & drop)
- [ ] Gestión de tallas con stock por talla
- [ ] Publicar / despublicar producto
- [ ] /admin/productos/:id/editar — edición de producto existente

### Panel Admin — Pedidos
- [ ] /admin/pedidos — lista de órdenes con filtro por estado
- [ ] Vista detalle de cada orden
- [ ] Email automático al admin al confirmarse un pago (via Resend)

## Fase 2 — Polish y animaciones

- [ ] Refinar animación de transición entre productos en el feed (slide suave)
- [ ] Animación de cambio de columnas en el grid (transition en gap/size)
- [ ] Feedback visual "ADDING" más pulido
- [ ] Optimización de imágenes (lazy loading, skeleton loaders)
- [ ] Manejo de errores: producto sin stock, fallo de red
- [ ] Estado vacío de carrito
- [ ] Página de confirmación post-pago (redirect desde MP)
- [ ] Descuento automático de stock via webhook MP verificado
- [ ] Indicador visual en admin cuando stock de una talla llega a 0

## Fase 3 — Extras / nice to have

- [ ] Analytics básicos de ventas en el admin
- [ ] Exportar pedidos a CSV
- [ ] Wishlist / favoritos (sin auth, guardado en localStorage)
- [ ] Filtro por color dentro de categoría
- [ ] Búsqueda de productos
- [ ] Analytics básicos (qué productos se ven más)
- [ ] PWA / instalable en home screen
