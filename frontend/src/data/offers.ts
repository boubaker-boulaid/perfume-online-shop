import cinqParfums from '../assets/images/offers/5-parfums-199-dh.webp'
import collection9Pm from '../assets/images/offers/collection-9-pm.webp'
import collectionGissah from '../assets/images/offers/collection-gissah.webp'
import collectionKayali from '../assets/images/offers/collection-kayali.webp'

export type OfferSeed = {
  id: number
  slug: string
  title: string
  tagline: string
  description: string
  image_path: string
  starts_at: string
  ends_at: string
  product_slugs: string[]
  free_product_slug?: string
  terms: string[]
}

// Counted from today so the fake offers never all expire.
const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(23, 59, 59, 0)

  return date.toISOString()
}

// An offer is a fixed-price set. Its price comes from the product with the same slug
// (see data/products.ts), and that's what reaches the cart and the order.
const terms = [
  'La réduction est déjà appliquée au prix affiché : aucun code à saisir.',
  'Offre valable dans la limite des stocks disponibles.',
  'Livraison offerte et paiement en espèces à la réception.',
]

export const offers: OfferSeed[] = [
  {
    id: 1,
    slug: '5-parfums-199-dh',
    title: '5 parfums à 199 DH + parfum gratuit',
    tagline: 'Cinq parfums à prix fixe, le sixième est offert.',
    description: 'Cinq parfums aux styles bien différents pour 199 DH, et un sixième offert : de quoi choisir selon l’humeur et le moment.',
    image_path: cinqParfums,
    starts_at: daysFromNow(-6),
    ends_at: daysFromNow(5),
    product_slugs: ['girl-of-now', 'inspire-de-gucci-bloom', 'turbulence', 'manifesto', 'baccarat-rouge-540'],
    free_product_slug: 'oud-majesty',
    terms,
  },
  {
    id: 2,
    slug: 'collection-gissah',
    title: 'Collection Gissah',
    tagline: 'Quatre parfums aux flacons dorés pour 180 DH.',
    description: 'Flair, La Luna, Legend of the Sky et Imperial Valley réunis dans une seule offre : quatre flacons ciselés, du plus chaud au plus doux.',
    image_path: collectionGissah,
    starts_at: daysFromNow(-3),
    ends_at: daysFromNow(12),
    product_slugs: ['flair', 'la-luna', 'legend-of-the-sky', 'imperial-valley'],
    terms,
  },
  {
    id: 3,
    slug: 'collection-kayali',
    title: 'Collection Kayali',
    tagline: 'Quatre parfums gourmands et solaires pour 180 DH.',
    description: 'Vanilla 28, Eden Juicy Apple, Maldives in a Bottle et Yum Marshmallow : de la vanille à la pomme, quatre parfums à porter en toute saison.',
    image_path: collectionKayali,
    starts_at: daysFromNow(-1),
    ends_at: daysFromNow(18),
    product_slugs: ['kayali-vanilla-28', 'kayali-eden-juicy-apple', 'kayali-maldives-in-a-bottle', 'kayali-yum-marshmallow'],
    terms,
  },
  {
    id: 4,
    slug: 'collection-9-pm',
    title: 'Collection 9 PM',
    tagline: 'Quatre extraits de parfum pour 180 DH.',
    description: '9 PM, Rebel, Elixir et Night Out : quatre extraits de parfum faits pour la soirée, à porter tour à tour.',
    image_path: collection9Pm,
    starts_at: daysFromNow(-2),
    ends_at: daysFromNow(26),
    product_slugs: ['9-pm', '9-pm-rebel', '9-pm-elixir', '9-pm-night-out'],
    terms,
  },
]
