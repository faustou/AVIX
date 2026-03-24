# AVIX — Arquitectura

## Diagrama de capas
```
[Mobile Browser — Tienda]          [Browser — Panel Admin /admin]
│                                      │
└──────────────┬───────────────────────┘
               ▼
[React + Vite + TypeScript] — Vercel
      │
      ├── Supabase Client (JS SDK)
      │         │
      │         ├── Auth — admin email/password
      │         ├── Database (PostgreSQL)
      │         ├── Storage — imágenes productos
      │         └── Edge Functions
      │                 ├── crear preferencia MP
      │                 ├── webhook MP → actualizar orden + stock
      │                 └── webhook MP → enviar email admin
      │
      └── Mercado Pago API
                └── Checkout + Webhooks
```

**No hay backend Express propio.** Toda la lógica que requiere server-side 
(como crear una preferencia de pago en MP que no debe exponer credenciales) 
se resuelve con Supabase Edge Functions.

## Decisiones técnicas

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| CSS Modules | Tailwind | Animaciones custom complejas requieren CSS puro; más control sobre keyframes y transitions específicas |
| CSS scroll-snap para el feed | Librería (react-swipeable, swiper.js) | Cero dependencias, el comportamiento nativo es suficiente para este caso |
| Supabase Edge Functions para MP | Backend Express en Render | No justifica un servidor separado para una sola integración de pagos |
| Sin auth para compradores | Auth completa | MVP: el flujo de compra no requiere cuenta. Se puede agregar en Fase 3 |
| Estado del carrito en Context | Zustand / Redux | Simplicidad para MVP; escalar a Zustand si el carrito crece en complejidad |
| Resend para emails | Nodemailer / SendGrid | API simple, buena integración con Edge Functions de Supabase, plan gratuito suficiente para el volumen esperado |

## Modelo de datos — Supabase
```sql
-- Categorías
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- 'new', 'mens', 'womens', 'slides', 'accessories'
  label text not null
);

-- Productos
create table products (
  id uuid primary key default gen_random_uuid(),
  code text not null,              -- 'YS-01', 'PK-01', etc.
  category_slug text references categories(slug),
  price numeric(10,2) not null,
  information text,                -- Texto de la sección INFORMATION (nullable)
  size_system text not null,       -- 'us_eu' | 'letter' | 'numeric'
  created_at timestamptz default now()
);

-- Imágenes de productos (múltiples por producto)
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  storage_path text not null,      -- path en Supabase Storage
  position integer not null,       -- orden en el carrusel
  color_variant text               -- 'brown', 'blue', 'grey' — para el scroll entre variantes
);

-- Tallas disponibles por producto
create table product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  size_us text,                    -- '7', '8', '9' / 'S', 'M', 'L'
  size_eu text,                    -- '40', '41', '42' / null si no aplica
  in_stock boolean default true
);

-- Órdenes (creadas al iniciar checkout)
create table orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mp_preference_id text,           -- ID de preferencia de Mercado Pago
  mp_payment_id text,              -- ID de pago confirmado (post-webhook)
  status text default 'pending',   -- 'pending' | 'paid' | 'failed'
  total numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Items de la orden
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  size text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

-- Administradores (gestionado via Supabase Auth)
-- Los admins son usuarios de Supabase Auth con email/password.
-- Para verificar si un usuario es admin se consulta esta tabla:
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- RLS: solo el propio admin puede ver su fila
-- La inserción de nuevos admins se hace desde Supabase Studio

-- Agregar columna published a products
alter table products add column published boolean default true;
-- Los productos con published=false no aparecen en la tienda

-- Agregar columna stock a product_sizes
-- (ya existe in_stock boolean, reemplazar por quantity integer)
-- product_sizes.in_stock → reemplazar por:
-- product_sizes.stock integer default 0
-- El stock se descuenta via trigger o Edge Function al confirmar pago
```

## Flujo de autenticación
No aplica para compradores en el MVP.
Admin accede via Supabase Auth (email/password) al panel en /admin.
Si no está autenticado, es redirigido a /admin/login.

## Variables de entorno
```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Mercado Pago (solo usadas en Edge Functions, nunca en el cliente)
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=

# App
VITE_APP_URL=

# Email (notificaciones al admin — Resend)
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=
```