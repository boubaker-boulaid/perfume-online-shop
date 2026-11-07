import bloom from '../assets/images/products/bloom.webp'
import goldenDusk from '../assets/images/products/golden-dusk.webp'
import noir from '../assets/images/products/noir.webp'
import oudMajesty from '../assets/images/products/oud-majesty.webp'
import pureMusk from '../assets/images/products/pure-musk.webp'
import type { Product } from '../types'
import { categories } from './categories'

type Seed = {
  name: string
  slug: string
  category: string
  image: string
  price: string
  compare?: string
  stock?: number
  description: string
  notes: string
  featured?: boolean
  hidden?: boolean
  rating: number
  reviews: number
}

// The first five are the best sellers from the design, with the same prices and ratings.
const seeds: Seed[] = [
  { name: 'Lumé Bloom', slug: 'lume-bloom', category: 'floral', image: bloom, price: '89.00', description: 'Un mélange délicat de fleurs et de musc, inspiré par la première lumière du matin.', notes: 'Fleur de pêcher, Jasmin, Musc blanc', featured: true, rating: 5, reviews: 128 },
  { name: 'Noir Essence', slug: 'noir-essence', category: 'woody', image: noir, price: '95.00', compare: '120.00', description: 'Cèdre fumé et cuir souple, profonds et silencieux comme l’heure qui précède l’aube.', notes: 'Poivre noir, Cèdre, Cuir', featured: true, rating: 4, reviews: 96 },
  { name: 'Golden Dusk', slug: 'golden-dusk', category: 'oriental', image: goldenDusk, price: '88.00', description: 'Ambre chaud et miel, lumineux comme les dernières minutes du coucher de soleil.', notes: 'Safran, Miel, Ambre', featured: true, rating: 5, reviews: 74 },
  { name: 'Pure Musk', slug: 'pure-musk', category: 'fresh', image: pureMusk, price: '82.00', compare: '100.00', description: 'Un musc pur et aérien qui reste près de la peau, comme un linge frais.', notes: 'Bergamote, Thé blanc, Musc', featured: true, rating: 5, reviews: 58 },
  { name: 'Oud Majesty', slug: 'oud-majesty', category: 'oriental', image: oudMajesty, price: '110.00', description: 'Un oud dense enveloppé de safran et de résine chaude, fait pour marquer les esprits.', notes: 'Safran, Oud, Benjoin', featured: true, rating: 4, reviews: 43 },
  { name: 'Bloom Intense', slug: 'bloom-intense', category: 'floral', image: bloom, price: '99.00', compare: '120.00', description: 'Lumé Bloom dans une concentration plus riche, au sillage floral plus long.', notes: 'Rose de Damas, Pivoine, Santal', rating: 5, reviews: 37 },
  { name: 'Noir Intense', slug: 'noir-intense', category: 'woody', image: noir, price: '125.00', compare: '160.00', description: 'Vétiver sombre et tabac, pour les soirées qui s’attardent.', notes: 'Tabac, Vétiver, Patchouli', rating: 4, reviews: 29 },
  { name: 'Golden Dusk Extrait', slug: 'golden-dusk-extrait', category: 'oriental', image: goldenDusk, price: '135.00', compare: '170.00', description: 'L’extrait de Golden Dusk : plus lent, plus chaud et plus proche de la peau.', notes: 'Cardamome, Ambre, Vanille', rating: 5, reviews: 21 },
  { name: 'Pure Musk Blanc', slug: 'pure-musk-blanc', category: 'fresh', image: pureMusk, price: '86.00', compare: '110.00', stock: 3, description: 'Un musc plus lumineux, relevé d’écorces d’agrumes et d’air marin.', notes: 'Zeste de citron, Sel marin, Musc', rating: 4, reviews: 18 },
  { name: 'Oud Royale', slug: 'oud-royale', category: 'oriental', image: oudMajesty, price: '150.00', compare: '175.00', description: 'Notre oud le plus profond, reposé six mois avant la mise en flacon.', notes: 'Absolu de rose, Oud, Labdanum', rating: 5, reviews: 15 },
  { name: 'Bloom Légère', slug: 'bloom-legere', category: 'floral', image: bloom, price: '78.00', compare: '100.00', description: 'Un Bloom plus léger pour la journée, doux et presque imperceptible.', notes: 'Poire, Muguet, Musc', rating: 4, reviews: 12 },
  { name: 'Noir Nuit', slug: 'noir-nuit', category: 'woody', image: noir, price: '105.00', stock: 0, description: 'Encens et bois noirs. Actuellement en rupture de stock.', notes: 'Encens, Ébène, Mousse de chêne', rating: 5, reviews: 9 },
  // Hidden, like an inactive product in the API: it must never appear in the shop.
  { name: 'Celestial Rose', slug: 'celestial-rose', category: 'floral', image: bloom, price: '140.00', hidden: true, description: 'Pas encore disponible.', notes: 'Rose', rating: 5, reviews: 0 },
]

export const products: Product[] = seeds.map((seed, index) => {
  const category = categories.find((item) => item.slug === seed.category)!

  return {
    id: index + 1,
    category_id: category.id,
    category,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    notes: seed.notes,
    sku: `PRF-${String(index + 1).padStart(3, '0')}-050`,
    price: seed.price,
    compare_at_price: seed.compare ?? null,
    stock: seed.stock ?? 25,
    sort_order: index + 1,
    image_path: seed.image,
    is_active: !seed.hidden,
    is_featured: seed.featured ?? false,
    created_at: new Date(Date.UTC(2026, 9, 1 + index)).toISOString(),
    rating: seed.rating,
    reviews_count: seed.reviews,
  }
})
