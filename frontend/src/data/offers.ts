import boisDeMinuit from '../assets/images/offers/bois-de-minuit.webp'
import briseMarine from '../assets/images/offers/brise-marine.webp'
import jardinEnFleurs from '../assets/images/offers/jardin-en-fleurs.webp'
import nuitsDOrient from '../assets/images/offers/nuits-d-orient.webp'

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
  terms: string[]
}

// Counted from today so the fake offers never all expire.
const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(23, 59, 59, 0)

  return date.toISOString()
}

// An offer only groups products that have a reduced price (compare_at_price), so
// the price on the page is the one that reaches the cart and the order.
const terms = [
  'La réduction est déjà appliquée au prix affiché : aucun code à saisir.',
  'Offre valable dans la limite des stocks disponibles.',
  'Livraison offerte et paiement en espèces à la réception.',
]

export const offers: OfferSeed[] = [
  {
    id: 1,
    slug: 'nuits-d-orient',
    title: 'Nuits d’Orient',
    tagline: 'Ambre, oud et safran à prix doux.',
    description: 'Quand le soleil disparaît derrière les dunes, l’ambre et l’oud prennent le relais. Deux de nos créations les plus profondes, à porter le soir et à garder longtemps sur la peau.',
    image_path: nuitsDOrient,
    starts_at: daysFromNow(-6),
    ends_at: daysFromNow(5),
    product_slugs: ['golden-dusk-extrait', 'oud-royale'],
    terms,
  },
  {
    id: 2,
    slug: 'jardin-en-fleurs',
    title: 'Jardin en fleurs',
    tagline: 'Deux Bloom pour le jour et le soir.',
    description: 'Une version légère pour la journée, une version intense pour la soirée. Rose, pivoine et muguet s’ouvrent comme un jardin à la tombée du jour.',
    image_path: jardinEnFleurs,
    starts_at: daysFromNow(-3),
    ends_at: daysFromNow(12),
    product_slugs: ['bloom-intense', 'bloom-legere'],
    terms,
  },
  {
    id: 3,
    slug: 'bois-de-minuit',
    title: 'Bois de minuit',
    tagline: 'Cèdre, cuir et tabac, sombres et élégants.',
    description: 'Une forêt au clair de lune, le cèdre fumé et le vétiver sombre. Deux parfums boisés pour celles et ceux qui aiment les sillages discrets et profonds.',
    image_path: boisDeMinuit,
    starts_at: daysFromNow(-1),
    ends_at: daysFromNow(18),
    product_slugs: ['noir-essence', 'noir-intense'],
    terms,
  },
  {
    id: 4,
    slug: 'brise-marine',
    title: 'Brise marine',
    tagline: 'Un musc frais comme l’air du large.',
    description: 'Sel marin, bergamote et musc blanc : la sensation d’un linge frais qui sèche face à l’océan. Deux parfums légers à porter tous les jours.',
    image_path: briseMarine,
    starts_at: daysFromNow(-2),
    ends_at: daysFromNow(26),
    product_slugs: ['pure-musk', 'pure-musk-blanc'],
    terms,
  },
]
