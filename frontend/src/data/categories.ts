import floral from '../assets/images/scenes/bloom.webp'
import fresh from '../assets/images/scenes/pure-musk.webp'
import oriental from '../assets/images/scenes/golden-dusk.webp'
import woody from '../assets/images/scenes/noir.webp'
import type { Category } from '../types'

// Same categories as backend/database/seeders/CategorySeeder.php
export const categories: Category[] = [
  { id: 1, name: 'Floral', slug: 'floral', description: 'Compositions de rose, jasmin et pivoine.', image_path: floral, is_active: true, sort_order: 1 },
  { id: 2, name: 'Oriental', slug: 'oriental', description: 'Ambre chaud, oud et épices.', image_path: oriental, is_active: true, sort_order: 2 },
  { id: 3, name: 'Boisé', slug: 'woody', description: 'Cèdre, santal et vétiver.', image_path: woody, is_active: true, sort_order: 3 },
  { id: 4, name: 'Frais', slug: 'fresh', description: 'Notes d’agrumes et marines.', image_path: fresh, is_active: true, sort_order: 4 },
]
