import bleuDeChanel from '../assets/images/home/perfumes/bleu-de-chanel.webp'
import missDior from '../assets/images/home/perfumes/miss-dior.webp'
import noirRose from '../assets/images/home/perfumes/noir-eau-de-parfum-rose.webp'
import noirGold from '../assets/images/home/perfumes/noir-l-eau-de-parfum.webp'
import noirPourHomme from '../assets/images/home/perfumes/noir-pour-homme.webp'
import sauvage from '../assets/images/home/perfumes/sauvage.webp'
import yvesSaintLaurent from '../assets/images/home/perfumes/yves-saint-laurent.webp'

// The bottles of the home page's carousel, in the order they're shown.
export type HomeFragrance = {
  image: string
  // the name written on the bottle
  name: string
  // Only for a perfume the shop sells: its category, price and page then come from the catalog.
  slug?: string
  // FAKE DATA, for a bottle that isn't in the catalog yet. Its button opens the shop.
  category?: string
  price?: string
}

// FAKE DATA: only Sauvage is a real product. The other six bottles come from the design, and their
// categories and prices are placeholders to replace with real ones.
// The carousel opens on the bottle in the middle of this list.
export const homeFragrances: HomeFragrance[] = [
  { image: noirPourHomme, name: 'Noir Pour Homme', category: 'Boisé', price: '85.00' },
  { image: bleuDeChanel, name: 'Bleu de Chanel', category: 'Boisé', price: '120.00' },
  { image: missDior, name: 'Miss Dior', category: 'Floral', price: '110.00' },
  { image: noirGold, name: 'Noir L’Eau de Parfum', category: 'Oriental', price: '95.00' },
  { image: sauvage, name: 'Sauvage', slug: 'sauvage' },
  { image: noirRose, name: 'Noir Eau de Parfum', category: 'Floral', price: '90.00' },
  { image: yvesSaintLaurent, name: 'Yves Saint Laurent', category: 'Oriental', price: '130.00' },
]
