import type { Product } from '@/types'

export const mockProducts: Product[] = [
  {
    id: '1',
    code: 'YS-01',
    category_slug: 'new',
    price: 40,
    discount_price: null,
    information: null,
    size_system: 'us_eu',
    created_at: '2024-01-01T00:00:00Z',
    product_images: [
      {
        id: 'img-1-a',
        product_id: '1',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=YS-01',
        position: 0,
      },
      {
        id: 'img-1-b',
        product_id: '1',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=YS-01-B',
        position: 1,
      },
    ],
    product_sizes: [
      { id: 'sz-1-s', product_id: '1', size_us: 'S', size_eu: null, stock: 3 },
      { id: 'sz-1-m', product_id: '1', size_us: 'M', size_eu: null, stock: 3 },
      { id: 'sz-1-l', product_id: '1', size_us: 'L', size_eu: null, stock: 0 },
    ],
  },
  {
    id: '2',
    code: 'PK-01',
    category_slug: 'remeras',
    price: 85,
    discount_price: null,
    information: 'Handcrafted from full-grain leather. Water-resistant treatment. Sole: natural rubber.',
    size_system: 'us_eu',
    created_at: '2024-01-02T00:00:00Z',
    product_images: [
      {
        id: 'img-2-a',
        product_id: '2',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=PK-01',
        position: 0,
      },
      {
        id: 'img-2-b',
        product_id: '2',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=PK-01-B',
        position: 1,
      },
      {
        id: 'img-2-c',
        product_id: '2',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=PK-01-C',
        position: 2,
      },
    ],
    product_sizes: [
      { id: 'sz-2-40', product_id: '2', size_us: '7', size_eu: '40', stock: 3 },
      { id: 'sz-2-41', product_id: '2', size_us: '8', size_eu: '41', stock: 3 },
      { id: 'sz-2-42', product_id: '2', size_us: '9', size_eu: '42', stock: 0 },
    ],
  },
  {
    id: '3',
    code: 'AC-01',
    category_slug: 'gollerias',
    price: 25,
    discount_price: null,
    information: null,
    size_system: 'letter',
    created_at: '2024-01-03T00:00:00Z',
    product_images: [
      {
        id: 'img-3-a',
        product_id: '3',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=AC-01',
        position: 0,
      },
      {
        id: 'img-3-b',
        product_id: '3',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=AC-01-B',
        position: 1,
      },
    ],
    product_sizes: [
      { id: 'sz-3-os', product_id: '3', size_us: 'ONE SIZE', size_eu: null, stock: 3 },
    ],
  },
  {
    id: '4',
    code: 'SL-01',
    category_slug: 'camperas',
    price: 55,
    discount_price: null,
    information: null,
    size_system: 'us_eu',
    created_at: '2024-01-04T00:00:00Z',
    product_images: [
      {
        id: 'img-4-a',
        product_id: '4',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=SL-01',
        position: 0,
      },
    ],
    product_sizes: [
      { id: 'sz-4-40', product_id: '4', size_us: '7', size_eu: '40', stock: 3 },
      { id: 'sz-4-41', product_id: '4', size_us: '8', size_eu: '41', stock: 3 },
    ],
  },
  {
    id: '5',
    code: 'WM-01',
    category_slug: 'musculosas',
    price: 70,
    discount_price: null,
    information: null,
    size_system: 'us_eu',
    created_at: '2024-01-05T00:00:00Z',
    product_images: [
      {
        id: 'img-5-a',
        product_id: '5',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=WM-01',
        position: 0,
      },
      {
        id: 'img-5-b',
        product_id: '5',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=WM-01-B',
        position: 1,
      },
    ],
    product_sizes: [
      { id: 'sz-5-s', product_id: '5', size_us: 'S', size_eu: null, stock: 3 },
      { id: 'sz-5-m', product_id: '5', size_us: 'M', size_eu: null, stock: 3 },
    ],
  },
  {
    id: '6',
    code: 'AC-02',
    category_slug: 'gollerias',
    price: 18,
    discount_price: null,
    information: 'Adjustable strap. One size fits all.',
    size_system: 'letter',
    created_at: '2024-01-06T00:00:00Z',
    product_images: [
      {
        id: 'img-6-a',
        product_id: '6',
        storage_path: 'https://placehold.co/400x400/ffffff/000000?text=AC-02',
        position: 0,
      },
    ],
    product_sizes: [
      { id: 'sz-6-os', product_id: '6', size_us: 'ONE SIZE', size_eu: null, stock: 3 },
    ],
  },
]
