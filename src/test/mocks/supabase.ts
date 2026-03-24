// Datos en formato raw de Supabase (storage_path = ruta relativa, no URL pública)
export const MOCK_PRODUCTS_DB = [
  {
    id: '1',
    code: 'YS-01',
    category_slug: 'new',
    price: 40,
    information: null,
    size_system: 'us_eu',
    created_at: '2024-01-01T00:00:00Z',
    published: true,
    product_images: [
      { id: 'img-1-a', product_id: '1', storage_path: 'products/ys-01.jpg', position: 0 },
    ],
    product_sizes: [
      { id: 'sz-1-s', product_id: '1', size_us: 'S', size_eu: null, stock: 3 },
      { id: 'sz-1-m', product_id: '1', size_us: 'M', size_eu: null, stock: 0 },
    ],
  },
  {
    id: '2',
    code: 'PK-01',
    category_slug: 'mens',
    price: 85,
    information: 'Full-grain leather.',
    size_system: 'us_eu',
    created_at: '2024-01-02T00:00:00Z',
    published: true,
    product_images: [
      { id: 'img-2-a', product_id: '2', storage_path: 'products/pk-01.jpg', position: 0 },
    ],
    product_sizes: [
      { id: 'sz-2-40', product_id: '2', size_us: '7', size_eu: '40', stock: 2 },
    ],
  },
]
