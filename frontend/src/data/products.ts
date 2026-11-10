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
import sauvage from '../assets/images/products/sauvage.webp'
import bloom from '../assets/images/products/bloom.webp'
import flairLaLuna from '../assets/images/products/flair-la-luna.webp'
import lunarL from '../assets/images/products/lunar-l.webp'
import lInterdit from '../assets/images/products/l-interdit.webp'
import smokeForTheSoul from '../assets/images/products/smoke-for-the-soul.webp'
import kayaliBlack from '../assets/images/products/kayali-black.webp'
import kayaliBlue from '../assets/images/products/kayali-blue.webp'
import kayaliRed from '../assets/images/products/kayali-red.webp'
import manifesto from '../assets/images/products/manifesto.webp'
import cocoMademoiselle from '../assets/images/products/coco-mademoiselle.webp'
import chicForMen from '../assets/images/products/chic-for-men.webp'
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
  // Moves the product in the shop's default order without changing its id or SKU
  sortOrder?: number
}

// The first five are the best sellers from the design, with the same prices and ratings.
const seeds: Seed[] = [
  { name: 'L’Interdit', slug: 'l-interdit', category: 'floral', image: lInterdit, price: '89.00', description: 'Sucré et fleuri, avec une touche d’amande. Un parfum doux qu’on porte tous les jours.', notes: 'Poire, Amande, Fleurs blanches', featured: true, rating: 5, reviews: 128 },
  { name: 'Sauvage', slug: 'sauvage', category: 'woody', image: sauvage, price: '95.00', compare: '120.00', description: 'Boisé et un peu fumé. Pour homme, idéal le soir.', notes: 'Poivre noir, Cèdre, Cuir', featured: true, rating: 4, reviews: 96 },
  { name: 'Smoke for the Soul', slug: 'smoke-for-the-soul', category: 'oriental', image: smokeForTheSoul, price: '88.00', description: 'Un bouquet de fleurs blanches, frais et féminin. Très demandé en cadeau.', notes: 'Tubéreuse, Jasmin, Fleurs blanches', featured: true, rating: 5, reviews: 74 },
  { name: 'Chic for Men', slug: 'chic-for-men', category: 'fresh', image: chicForMen, price: '82.00', compare: '100.00', description: 'Un musc propre et léger, comme du linge frais. Discret et agréable.', notes: 'Bergamote, Thé blanc, Musc', featured: true, rating: 5, reviews: 58 },
  { name: 'Coco Mademoiselle', slug: 'coco-mademoiselle', category: 'oriental', image: cocoMademoiselle, price: '110.00', description: 'Un oud fort avec du safran. Il tient toute la journée et on le remarque.', notes: 'Safran, Oud, Benjoin', featured: true, rating: 4, reviews: 43 },
  { name: 'Lunar L', slug: 'lunar-l', category: 'floral', image: lunarL, price: '99.00', compare: '120.00', description: 'Un parfum fort qui tient longtemps sur la peau.', notes: 'Rose, Pivoine, Santal', rating: 5, reviews: 37 },
  { name: 'Kayali Vanilla 28', slug: 'kayali-vanilla-28', category: 'woody', image: kayaliBlack, price: '125.00', compare: '160.00', description: 'Une vanille chaude et gourmande. Doux sans être trop sucré.', notes: 'Vanille, Ambre, Fève tonka', rating: 4, reviews: 29 },
  { name: 'Manifesto', slug: 'manifesto', category: 'oriental', image: manifesto, price: '135.00', compare: '170.00', description: 'Chaud et épicé, pour les soirées et l’hiver.', notes: 'Cardamome, Ambre, Vanille', rating: 5, reviews: 21, sortOrder: 99 },
  { name: 'Kayali Maldives in a Bottle', slug: 'kayali-maldives-in-a-bottle', category: 'fresh', image: kayaliBlue, price: '86.00', compare: '110.00', stock: 3, description: 'Frais et fruité, ça sent les vacances. Parfait pour l’été.', notes: 'Fruits exotiques, Notes marines, Musc', rating: 4, reviews: 18 },
  { name: 'Baccarat Rouge 540', slug: 'baccarat-rouge-540', category: 'oriental', image: baccaratRouge, price: '150.00', compare: '175.00', description: 'Ambré et un peu sucré, avec un sillage qu’on reconnaît tout de suite.', notes: 'Safran, Jasmin, Ambre, Cèdre', rating: 5, reviews: 15 },
  { name: 'Kayali Yum Marshmallow', slug: 'kayali-yum-marshmallow', category: 'floral', image: kayaliRed, price: '78.00', compare: '100.00', description: 'Gourmand et sucré, comme un bonbon. Très apprécié par les jeunes.', notes: 'Guimauve, Vanille, Fruits rouges', rating: 4, reviews: 12 },
  { name: 'Flair & La Luna', slug: 'flair-la-luna', category: 'woody', image: flairLaLuna, price: '105.00', stock: 0, description: 'Le duo de la collection Gissah. Actuellement épuisé.', notes: 'Encens, Ambre, Bois', rating: 5, reviews: 9 },
  // Hidden, like an inactive product in the API: it must never appear in the shop.
  { name: 'Celestial Rose', slug: 'celestial-rose', category: 'floral', image: bloom, price: '140.00', hidden: true, description: 'Pas encore disponible.', notes: 'Rose', rating: 5, reviews: 0 },
  { name: 'Flair', slug: 'flair', category: 'oriental', image: flair, price: '60.00', description: 'Chaud et lumineux, de la collection Gissah.', notes: 'Safran, Rose, Ambre', rating: 5, reviews: 14 },
  { name: 'La Luna', slug: 'la-luna', category: 'oriental', image: laLuna, price: '60.00', description: 'Ambré et doux, de la collection Gissah.', notes: 'Ambre, Vanille, Santal', rating: 4, reviews: 11 },
  { name: 'Legend of the Sky', slug: 'legend-of-the-sky', category: 'floral', image: legendOfTheSky, price: '60.00', description: 'Floral et léger, de la collection Gissah.', notes: 'Pivoine, Rose, Musc', rating: 5, reviews: 8 },
  { name: 'Imperial Valley', slug: 'imperial-valley', category: 'fresh', image: imperialValley, price: '60.00', description: 'Frais et doux, de la collection Gissah.', notes: 'Bergamote, Thé blanc, Musc', rating: 4, reviews: 7 },
  { name: 'Kayali Eden Juicy Apple', slug: 'kayali-eden-juicy-apple', category: 'fresh', image: kayaliEden, price: '95.00', description: 'Fruité et pétillant, avec beaucoup de pomme.', notes: 'Pomme, Poire, Musc', rating: 5, reviews: 16 },
  { name: '9 PM', slug: '9-pm', category: 'woody', image: nine, price: '65.00', description: 'Le classique de la collection 9 PM. Sucré et chaud, pour homme.', notes: 'Pomme, Lavande, Vanille', rating: 5, reviews: 22 },
  { name: '9 PM Rebel', slug: '9-pm-rebel', category: 'woody', image: nineRebel, price: '65.00', description: 'Plus fort et plus boisé que le 9 PM classique.', notes: 'Cuir, Poivre, Cèdre', rating: 4, reviews: 13 },
  { name: '9 PM Elixir', slug: '9-pm-elixir', category: 'oriental', image: nineElixir, price: '65.00', description: 'Le plus chaud de la collection, avec du oud.', notes: 'Cannelle, Ambre, Oud', rating: 5, reviews: 10 },
  { name: '9 PM Night Out', slug: '9-pm-night-out', category: 'woody', image: nineNightOut, price: '65.00', description: 'Pour sortir le soir. Épicé et un peu sucré.', notes: 'Poivre noir, Patchouli, Vanille', rating: 4, reviews: 9 },
  // The fixed-price sets. Each one is sold as a single product, so its price can't change with what's
  // in the bag. It has the offer's slug and never appears in the shop, only on the offer's page.
  { name: 'Pack 5 parfums + 1 offert', slug: '5-parfums-199-dh', category: 'oriental', image: cinqParfumsOffer, price: '199.00', offer: true, description: 'L’Interdit, Smoke for the Soul, Chic for Men, Manifesto, Baccarat Rouge 540 + Coco Mademoiselle offert', notes: '', rating: 5, reviews: 0 },
  { name: 'Pack Gissah, 4 parfums', slug: 'collection-gissah', category: 'oriental', image: collectionGissahOffer, price: '180.00', offer: true, description: 'Flair, La Luna, Legend of the Sky, Imperial Valley', notes: '', rating: 5, reviews: 0 },
  { name: 'Pack Kayali, 4 parfums', slug: 'collection-kayali', category: 'oriental', image: collectionKayaliOffer, price: '180.00', offer: true, description: 'Kayali Vanilla 28, Kayali Eden Juicy Apple, Kayali Maldives in a Bottle, Kayali Yum Marshmallow', notes: '', rating: 5, reviews: 0 },
  { name: 'Pack 9 PM, 4 parfums', slug: 'collection-9-pm', category: 'woody', image: collection9PmOffer, price: '180.00', offer: true, description: '9 PM, 9 PM Rebel, 9 PM Elixir, 9 PM Night Out', notes: '', rating: 5, reviews: 0 },
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
    sort_order: seed.sortOrder ?? index + 1,
    image_path: seed.image,
    is_active: !seed.hidden,
    is_offer: seed.offer ?? false,
    is_featured: seed.featured ?? false,
    created_at: new Date(Date.UTC(2026, 9, 1 + index)).toISOString(),
    rating: seed.rating,
    reviews_count: seed.reviews,
  }
})
