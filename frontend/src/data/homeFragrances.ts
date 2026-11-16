import bleuDeChanel from '../assets/images/home/perfumes/bleu-de-chanel.webp'
import missDior from '../assets/images/home/perfumes/miss-dior.webp'
import noirRose from '../assets/images/home/perfumes/noir-eau-de-parfum-rose.webp'
import noirGold from '../assets/images/home/perfumes/noir-l-eau-de-parfum.webp'
import noirPourHomme from '../assets/images/home/perfumes/noir-pour-homme.webp'
import sauvage from '../assets/images/home/perfumes/sauvage.webp'
import yvesSaintLaurent from '../assets/images/home/perfumes/yves-saint-laurent.webp'

// The bottles of the home page's carousel, in the order they're shown. Each one is a product of
// the catalog: its category, price and page come from there. The picture is the carousel's
// own cut-out bottle, so Sauvage keeps its usual photo in the shop.
export type HomeFragrance = {
  image: string
  // shown while the catalog loads
  name: string
  slug: string
}

// The carousel opens on the bottle in the middle of this list.
export const homeFragrances: HomeFragrance[] = [
  { image: noirPourHomme, name: 'Noir Pour Homme', slug: 'noir-pour-homme' },
  { image: bleuDeChanel, name: 'Bleu de Chanel', slug: 'bleu-de-chanel' },
  { image: missDior, name: 'Miss Dior', slug: 'miss-dior' },
  { image: noirGold, name: 'Noir L’Eau de Parfum', slug: 'noir-l-eau-de-parfum' },
  { image: sauvage, name: 'Sauvage', slug: 'sauvage' },
  { image: noirRose, name: 'Noir Eau de Parfum', slug: 'noir-eau-de-parfum' },
  { image: yvesSaintLaurent, name: 'Yves Saint Laurent', slug: 'yves-saint-laurent' },
]
