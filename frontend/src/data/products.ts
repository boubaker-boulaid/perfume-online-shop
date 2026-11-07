import cinqParfumsOffer from '../assets/images/offers/5-parfums-199-dh.webp'
import collection9PmOffer from '../assets/images/offers/collection-9-pm.webp'
import collectionGissahOffer from '../assets/images/offers/collection-gissah.webp'
import collectionKayaliOffer from '../assets/images/offers/collection-kayali.webp'
import nineElixir from '../assets/images/products/9-pm-elixir.webp'
import nineNightOut from '../assets/images/products/9-pm-night-out.webp'
import nineRebel from '../assets/images/products/9-pm-rebel.webp'
import nine from '../assets/images/products/9-pm.webp'
import flair from '../assets/images/products/flair.webp'
import imperialValley from '../assets/images/products/imperial-valley.webp'
import kayaliEden from '../assets/images/products/kayali-eden.webp'
import laLuna from '../assets/images/products/la-luna.webp'
import legendOfTheSky from '../assets/images/products/legend-of-the-sky.webp'
import baccaratRouge from '../assets/images/products/baccarat-rouge.webp'
import blackTassel from '../assets/images/products/black-tassel.webp'
import bloom from '../assets/images/products/bloom.webp'
import flairLaLuna from '../assets/images/products/flair-la-luna.webp'
import girlOfNowGreen from '../assets/images/products/girl-of-now-green.webp'
import girlOfNowWhite from '../assets/images/products/girl-of-now-white.webp'
import gucciBloom from '../assets/images/products/gucci-bloom.webp'
import kayaliBlack from '../assets/images/products/kayali-black.webp'
import kayaliBlue from '../assets/images/products/kayali-blue.webp'
import kayaliRed from '../assets/images/products/kayali-red.webp'
import manifesto from '../assets/images/products/manifesto.webp'
import redTassel from '../assets/images/products/red-tassel.webp'
import turbulence from '../assets/images/products/turbulence.webp'
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
  offer?: boolean
  rating: number
  reviews: number
}

// The first five are the best sellers from the design, with the same prices and ratings.
const seeds: Seed[] = [
  { name: 'Girl of Now', slug: 'girl-of-now', category: 'floral', image: girlOfNowWhite, price: '89.00', description: 'Un mélange délicat de fleurs et de musc, inspiré par la première lumière du matin.', notes: 'Fleur de pêcher, Jasmin, Musc blanc', featured: true, rating: 5, reviews: 128 },
  { name: 'Noir Essence', slug: 'noir-essence', category: 'woody', image: blackTassel, price: '95.00', compare: '120.00', description: 'Cèdre fumé et cuir souple, profonds et silencieux comme l’heure qui précède l’aube.', notes: 'Poivre noir, Cèdre, Cuir', featured: true, rating: 4, reviews: 96 },
  { name: 'Inspiré de Gucci Bloom', slug: 'inspire-de-gucci-bloom', category: 'oriental', image: gucciBloom, price: '88.00', description: 'Ambre chaud et miel, lumineux comme les dernières minutes du coucher de soleil.', notes: 'Safran, Miel, Ambre', featured: true, rating: 5, reviews: 74 },
  { name: 'Turbulence', slug: 'turbulence', category: 'fresh', image: turbulence, price: '82.00', compare: '100.00', description: 'Un musc pur et aérien qui reste près de la peau, comme un linge frais.', notes: 'Bergamote, Thé blanc, Musc', featured: true, rating: 5, reviews: 58 },
  { name: 'Oud Majesty', slug: 'oud-majesty', category: 'oriental', image: redTassel, price: '110.00', description: 'Un oud dense enveloppé de safran et de résine chaude, fait pour marquer les esprits.', notes: 'Safran, Oud, Benjoin', featured: true, rating: 4, reviews: 43 },
  { name: 'Girl of Now Intense', slug: 'girl-of-now-intense', category: 'floral', image: girlOfNowGreen, price: '99.00', compare: '120.00', description: 'Girl of Now dans une concentration plus riche, au sillage floral plus long.', notes: 'Rose de Damas, Pivoine, Santal', rating: 5, reviews: 37 },
  { name: 'Kayali Vanilla 28', slug: 'kayali-vanilla-28', category: 'woody', image: kayaliBlack, price: '125.00', compare: '160.00', description: 'Vétiver sombre et tabac, pour les soirées qui s’attardent.', notes: 'Tabac, Vétiver, Patchouli', rating: 4, reviews: 29 },
  { name: 'Manifesto', slug: 'manifesto', category: 'oriental', image: manifesto, price: '135.00', compare: '170.00', description: 'Plus lent, plus chaud et plus proche de la peau.', notes: 'Cardamome, Ambre, Vanille', rating: 5, reviews: 21 },
  { name: 'Kayali Maldives in a Bottle', slug: 'kayali-maldives-in-a-bottle', category: 'fresh', image: kayaliBlue, price: '86.00', compare: '110.00', stock: 3, description: 'Un musc plus lumineux, relevé d’écorces d’agrumes et d’air marin.', notes: 'Zeste de citron, Sel marin, Musc', rating: 4, reviews: 18 },
  { name: 'Baccarat Rouge 540', slug: 'baccarat-rouge-540', category: 'oriental', image: baccaratRouge, price: '150.00', compare: '175.00', description: 'Notre oud le plus profond, reposé six mois avant la mise en flacon.', notes: 'Absolu de rose, Oud, Labdanum', rating: 5, reviews: 15 },
  { name: 'Kayali Yum Marshmallow', slug: 'kayali-yum-marshmallow', category: 'floral', image: kayaliRed, price: '78.00', compare: '100.00', description: 'Un parfum léger pour la journée, doux et presque imperceptible.', notes: 'Poire, Muguet, Musc', rating: 4, reviews: 12 },
  { name: 'Flair & La Luna', slug: 'flair-la-luna', category: 'woody', image: flairLaLuna, price: '105.00', stock: 0, description: 'Encens et bois noirs. Actuellement en rupture de stock.', notes: 'Encens, Ébène, Mousse de chêne', rating: 5, reviews: 9 },
  // Hidden, like an inactive product in the API: it must never appear in the shop.
  { name: 'Celestial Rose', slug: 'celestial-rose', category: 'floral', image: bloom, price: '140.00', hidden: true, description: 'Pas encore disponible.', notes: 'Rose', rating: 5, reviews: 0 },
  { name: 'Flair', slug: 'flair', category: 'oriental', image: flair, price: '60.00', description: 'Un parfum chaud et lumineux de la collection Gissah.', notes: 'Safran, Rose, Ambre', rating: 5, reviews: 14 },
  { name: 'La Luna', slug: 'la-luna', category: 'oriental', image: laLuna, price: '60.00', description: 'Un parfum ambré et enveloppant de la collection Gissah.', notes: 'Ambre, Vanille, Bois de santal', rating: 4, reviews: 11 },
  { name: 'Legend of the Sky', slug: 'legend-of-the-sky', category: 'floral', image: legendOfTheSky, price: '60.00', description: 'Un parfum floral et léger de la collection Gissah.', notes: 'Pivoine, Rose, Musc', rating: 5, reviews: 8 },
  { name: 'Imperial Valley', slug: 'imperial-valley', category: 'fresh', image: imperialValley, price: '60.00', description: 'Un parfum doux et frais de la collection Gissah.', notes: 'Bergamote, Thé blanc, Musc', rating: 4, reviews: 7 },
  { name: 'Kayali Eden Juicy Apple', slug: 'kayali-eden-juicy-apple', category: 'fresh', image: kayaliEden, price: '95.00', description: 'Un parfum fruité et pétillant de la collection Kayali.', notes: 'Pomme, Poire, Musc', rating: 5, reviews: 16 },
  { name: '9 PM', slug: '9-pm', category: 'woody', image: nine, price: '65.00', description: 'L’extrait de parfum qui donne son nom à la collection 9 PM.', notes: 'Pomme, Lavande, Vanille', rating: 5, reviews: 22 },
  { name: '9 PM Rebel', slug: '9-pm-rebel', category: 'woody', image: nineRebel, price: '65.00', description: 'Un extrait de parfum audacieux de la collection 9 PM.', notes: 'Cuir, Poivre, Bois de cèdre', rating: 4, reviews: 13 },
  { name: '9 PM Elixir', slug: '9-pm-elixir', category: 'oriental', image: nineElixir, price: '65.00', description: 'Un extrait de parfum riche et chaud de la collection 9 PM.', notes: 'Cannelle, Ambre, Oud', rating: 5, reviews: 10 },
  { name: '9 PM Night Out', slug: '9-pm-night-out', category: 'woody', image: nineNightOut, price: '65.00', description: 'Un extrait de parfum pour les longues soirées, de la collection 9 PM.', notes: 'Poivre noir, Patchouli, Vanille', rating: 4, reviews: 9 },
  // The fixed-price sets. Each one is sold as a single product, so its price can't change with what's
  // in the bag. It has the offer's slug and never appears in the shop, only on the offer's page.
  { name: '5 parfums + 1 offert', slug: '5-parfums-199-dh', category: 'oriental', image: cinqParfumsOffer, price: '199.00', offer: true, description: 'Girl of Now, Inspiré de Gucci Bloom, Turbulence, Manifesto, Baccarat Rouge 540 + Oud Majesty offert', notes: '', rating: 5, reviews: 0 },
  { name: 'Collection Gissah, 4 parfums', slug: 'collection-gissah', category: 'oriental', image: collectionGissahOffer, price: '180.00', offer: true, description: 'Flair, La Luna, Legend of the Sky, Imperial Valley', notes: '', rating: 5, reviews: 0 },
  { name: 'Collection Kayali, 4 parfums', slug: 'collection-kayali', category: 'oriental', image: collectionKayaliOffer, price: '180.00', offer: true, description: 'Kayali Vanilla 28, Kayali Eden Juicy Apple, Kayali Maldives in a Bottle, Kayali Yum Marshmallow', notes: '', rating: 5, reviews: 0 },
  { name: 'Collection 9 PM, 4 parfums', slug: 'collection-9-pm', category: 'woody', image: collection9PmOffer, price: '180.00', offer: true, description: '9 PM, 9 PM Rebel, 9 PM Elixir, 9 PM Night Out', notes: '', rating: 5, reviews: 0 },
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
    is_offer: seed.offer ?? false,
    is_featured: seed.featured ?? false,
    created_at: new Date(Date.UTC(2026, 9, 1 + index)).toISOString(),
    rating: seed.rating,
    reviews_count: seed.reviews,
  }
})
