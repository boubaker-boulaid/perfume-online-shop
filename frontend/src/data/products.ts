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
  { name: 'Girl of Now', slug: 'girl-of-now', category: 'floral', image: girlOfNowWhite, price: '89.00', description: 'Sucré et fleuri, avec une touche d’amande. Un parfum doux qu’on porte tous les jours.', notes: 'Poire, Amande, Fleurs blanches', featured: true, rating: 5, reviews: 128 },
  { name: 'Noir Essence', slug: 'noir-essence', category: 'woody', image: blackTassel, price: '95.00', compare: '120.00', description: 'Boisé et un peu fumé. Pour homme, idéal le soir.', notes: 'Poivre noir, Cèdre, Cuir', featured: true, rating: 4, reviews: 96 },
  { name: 'Inspiré de Gucci Bloom', slug: 'inspire-de-gucci-bloom', category: 'oriental', image: gucciBloom, price: '88.00', description: 'Un bouquet de fleurs blanches, frais et féminin. Très demandé en cadeau.', notes: 'Tubéreuse, Jasmin, Fleurs blanches', featured: true, rating: 5, reviews: 74 },
  { name: 'Turbulence', slug: 'turbulence', category: 'fresh', image: turbulence, price: '82.00', compare: '100.00', description: 'Un musc propre et léger, comme du linge frais. Discret et agréable.', notes: 'Bergamote, Thé blanc, Musc', featured: true, rating: 5, reviews: 58 },
  { name: 'Oud Majesty', slug: 'oud-majesty', category: 'oriental', image: redTassel, price: '110.00', description: 'Un oud fort avec du safran. Il tient toute la journée et on le remarque.', notes: 'Safran, Oud, Benjoin', featured: true, rating: 4, reviews: 43 },
  { name: 'Girl of Now Intense', slug: 'girl-of-now-intense', category: 'floral', image: girlOfNowGreen, price: '99.00', compare: '120.00', description: 'La version plus forte de Girl of Now, qui tient plus longtemps.', notes: 'Rose, Pivoine, Santal', rating: 5, reviews: 37 },
  { name: 'Kayali Vanilla 28', slug: 'kayali-vanilla-28', category: 'woody', image: kayaliBlack, price: '125.00', compare: '160.00', description: 'Une vanille chaude et gourmande. Doux sans être trop sucré.', notes: 'Vanille, Ambre, Fève tonka', rating: 4, reviews: 29 },
  { name: 'Manifesto', slug: 'manifesto', category: 'oriental', image: manifesto, price: '135.00', compare: '170.00', description: 'Chaud et épicé, pour les soirées et l’hiver.', notes: 'Cardamome, Ambre, Vanille', rating: 5, reviews: 21 },
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
  { name: 'Pack 5 parfums + 1 offert', slug: '5-parfums-199-dh', category: 'oriental', image: cinqParfumsOffer, price: '199.00', offer: true, description: 'Girl of Now, Inspiré de Gucci Bloom, Turbulence, Manifesto, Baccarat Rouge 540 + Oud Majesty offert', notes: '', rating: 5, reviews: 0 },
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
