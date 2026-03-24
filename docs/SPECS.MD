# AVIX — Especificaciones funcionales

## Descripción general
AVIX es una tienda de ropa y accesorios con experiencia mobile-first 
ultra minimalista. El diseño prioriza el producto sobre cualquier elemento 
de UI. No hay cuenta de usuario, no hay búsqueda compleja: el flujo es 
ver → elegir talla → comprar.

## Roles de usuario
- **Comprador**: usuario anónimo. Navega, agrega al carrito y compra.
- **Admin**: accede al panel en /admin para gestionar productos y ver pedidos.

## Features por módulo

### Módulo: Grid de productos
- Vista inicial muestra categoría "NEW" con grid de 3 columnas
- Botón `+` en header izquierdo cicla columnas: 3 → 2 → 1 → 2 → 3 (progresivo, sin saltos)
- Cada celda muestra: imagen del producto (fondo blanco, producto flotante) + código (ej: YS-01)
- Al tocar una celda se abre la vista de feed posicionada en ese producto

### Módulo: Navegación / filtros
- Navbar centrado con 5 categorías: NEW · MENS · WOMENS · SLIDES · ACCESSORIES
- Categoría activa: texto negro/bold. Inactivas: texto gris/normal
- Ícono de carrito top-right con contador numérico de items
- Flecha `←` top-left aparece dentro de la vista de detalle para volver al grid

### Módulo: Feed de productos (vista detalle)
- Lista vertical con scroll-snap: cada producto ocupa el 100% del viewport
- Scroll hacia arriba/abajo cambia al producto anterior/siguiente de la categoría activa
- Dentro de cada producto: carrusel horizontal de imágenes con dots indicadores
- Info visible: código del producto, precio, botón `+`
- Si el producto tiene `information`: se muestra link/texto "INFORMATION" al fondo

### Módulo: Panel de tallas
- Se activa al tocar `+` en la vista de detalle
- El `+` hace animación hacia arriba-derecha mientras rota y se convierte en `×`
- Los talles aparecen con stagger slide-up desde la posición del botón
- Header del panel: `?` a la izquierda · "SELECT SIZE" centrado · `×` a la derecha
- Precio del producto debajo del header
- Grid de talles disponibles (los sin stock se muestran tachados o deshabilitados)
- Botón `?`: alterna el sistema de tallas (US↔EU, o número↔letra según el producto)
- Al seleccionar un talle: el header cambia a "ADDING" por ~300ms, luego el panel se cierra
- El item se agrega al carrito y el contador del ícono se actualiza

### Módulo: INFORMATION
- Disponible solo en productos que tienen texto en el campo `information`
- Al tocar: el texto "INFORMATION" desaparece y el contenido entra desde abajo (slide-up)
- Al tocar de nuevo: colapsa con slide-down y vuelve a mostrar "INFORMATION"

### Módulo: Carrito
- Accesible desde el ícono top-right
- Muestra: imagen miniatura · código · talla · qty (con `+` y `−`) · precio unitario
- Si qty llega a 0: el item se elimina del carrito
- Totales: SUBTOTAL · SHIPPING (calculated at next step) · TAXES · TOTAL
- Botones de express checkout: Apple Pay · PayPal (placeholders en MVP)
- Separador "OR CONTINUE BELOW"
- Formulario de contacto: EMAIL ADDRESS + checkbox "SUBSCRIBE TO UPDATES"

### Módulo: Checkout
- Integración con Mercado Pago via Supabase Edge Function
- La Edge Function crea una preferencia de pago y devuelve el init_point
- El comprador es redirigido a MP para completar el pago
- Post-pago: MP hace webhook a la Edge Function que actualiza el estado de la orden

### Módulo: Footer
- Visible al final del scroll del grid (no en la vista de detalle)
- Links en una línea: CONTACT · TERMS · PRIVACY · ACCESSIBILITY · DNSMPI · COOKIES

## Flujos principales

### Flujo: Compra completa
1. Usuario abre la app → ve grid 3 columnas categoría NEW
2. Toca `+` una vez → grid pasa a 2 columnas
3. Toca un producto → se abre feed de detalle en ese producto
4. Swipe horizontal → ve más fotos del mismo producto
5. Scroll vertical → ve el producto siguiente
6. Toca `+` → aparece panel de tallas con animación
7. Toca `?` → cambia sistema de tallas si necesita
8. Selecciona talla → "ADDING" → panel se cierra → contador del carrito +1
9. Toca el ícono del carrito → ve order summary
10. Toca "Continuar" → ingresa email → es redirigido a Mercado Pago
11. Completa el pago en MP → vuelve a AVIX con confirmación

### Flujo: Cambio de categoría
1. Usuario está viendo el grid de NEW
2. Toca "SLIDES" en el navbar
3. El grid se actualiza con los productos de esa categoría
4. El estado de columnas se mantiene (no se resetea al cambiar categoría)

## Fuera de scope (MVP)
- Versión desktop
- Cuenta de usuario / login para compradores
- Wishlist / favoritos
- Búsqueda de productos
- Filtro por color
- Internacionalización / multi-idioma
- Reviews / ratings de productos

---

## Panel de Administración

### Descripción
Ruta protegida en /admin accesible solo para administradores
autenticados. Permite gestionar productos, ver pedidos y
monitorear pagos. Diseñado para un usuario joven con
conocimiento tecnológico básico — la UI debe ser simple
y directa.

### Acceso y autenticación
- Ruta: /admin (y subrutas /admin/productos, /admin/pedidos)
- Auth via Supabase Auth con email/password
- Múltiples administradores posibles
- Sin roles diferenciados — todos los admins tienen acceso completo
- La gestión de qué emails son admin se hace desde Supabase Studio
- Si un usuario no autenticado intenta acceder a /admin
  es redirigido al login

### Módulo: Productos
- Lista de todos los productos con foto miniatura, código,
  precio, categoría y estado (publicado/despublicado)
- Crear producto nuevo con:
  * Código (ej: YS-01)
  * Categoría (selector: new/mens/womens/slides/accessories)
  * Precio
  * Información (texto opcional)
  * Sistema de tallas (us_eu / letter / numeric)
  * Fotos: subida múltiple, reordenables via drag,
    mínimo 1 requerida
  * Tallas disponibles con stock por talla (ej: talle 8 → 4 unidades)
- Editar cualquier campo de un producto existente
- Publicar / despublicar producto (el producto despublicado
  no aparece en la tienda pero no se borra)
- El stock se descuenta automáticamente cuando Mercado Pago
  confirma un pago via webhook — no es manual

### Módulo: Pedidos
- Lista de órdenes ordenadas por fecha descendente
- Cada fila muestra: fecha, email del cliente, productos
  comprados con talla y cantidad, total, estado del pago
- Estados posibles: pendiente / pagado / fallido
- Filtro por estado
- Al confirmarse un pago (webhook MP) se envía email
  automático al admin con el detalle completo del pedido
- No hay gestión de devoluciones ni reembolsos en el MVP

### Flujo del administrador — cargar producto nuevo
1. Admin entra a /admin/productos
2. Toca "Nuevo producto"
3. Completa el formulario: código, categoría, precio,
   info, sistema de tallas
4. Sube las fotos (drag & drop o selector de archivos)
5. Reordena las fotos si hace falta
6. Agrega las tallas disponibles con stock por talla
7. Toca "Publicar" → el producto aparece en la tienda

### Flujo del administrador — ver pedidos
1. Admin entra a /admin/pedidos
2. Ve la lista de órdenes recientes
3. Puede filtrar por estado para ver solo los pagados
4. Al llegar un pago nuevo recibe email automático

### Fuera de scope del admin (MVP)
- Analytics / estadísticas de ventas
- Gestión de administradores desde el panel
- Devoluciones y reembolsos
- Notificaciones push
- Exportar pedidos a CSV