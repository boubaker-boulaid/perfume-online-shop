<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    use CopiesSeedImages;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $terms = [
            'Le prix affiché est déjà réduit, pas besoin de code.',
            'Dans la limite des stocks.',
            'Livraison gratuite, paiement à la réception.',
        ];

        // the same offers as frontend/src/data/offers.ts
        // each offer's set is the product with the same slug (see ProductSeeder): its price is the offer's price
        // starts and ends are days from today, so the seeded offers don't all expire
        $offers = [
            [
                'slug' => '5-parfums-199-dh',
                'title' => '5 parfums à 199 DH + 1 offert',
                'tagline' => 'Prenez 5 parfums, le 6e est cadeau.',
                'description' => '5 parfums différents pour 199 DH, et on vous en ajoute un 6e gratuit. De quoi changer selon l’humeur.',
                'image' => 'offers/5-parfums-199-dh.webp',
                'starts' => -6,
                'ends' => 5,
                'products' => ['l-interdit', 'smoke-for-the-soul', 'chic-for-men', 'manifesto', 'baccarat-rouge-540'],
                'free_product' => 'coco-mademoiselle',
            ],
            [
                'slug' => 'collection-gissah',
                'title' => 'Pack Gissah',
                'tagline' => '4 parfums Gissah pour 180 DH.',
                'description' => 'Flair, La Luna, Legend of the Sky et Imperial Valley dans un seul pack. Du plus chaud au plus doux, il y en a pour chaque jour.',
                'image' => 'offers/collection-gissah.webp',
                'starts' => -3,
                'ends' => 12,
                'products' => ['flair', 'la-luna', 'legend-of-the-sky', 'imperial-valley'],
            ],
            [
                'slug' => 'collection-kayali',
                'title' => 'Pack Kayali',
                'tagline' => '4 parfums sucrés et fruités pour 180 DH.',
                'description' => 'Vanilla 28, Eden Juicy Apple, Maldives in a Bottle et Yum Marshmallow. De la vanille à la pomme, 4 parfums qu’on porte toute l’année.',
                'image' => 'offers/collection-kayali.webp',
                'starts' => -1,
                'ends' => 18,
                'products' => ['kayali-vanilla-28', 'kayali-eden-juicy-apple', 'kayali-maldives-in-a-bottle', 'kayali-yum-marshmallow'],
            ],
            [
                'slug' => 'collection-9-pm',
                'title' => 'Pack 9 PM',
                'tagline' => '4 parfums 9 PM pour 180 DH.',
                'description' => '9 PM, Rebel, Elixir et Night Out. Les 4 parfums de la gamme, parfaits pour le soir.',
                'image' => 'offers/collection-9-pm.webp',
                'starts' => -2,
                'ends' => 26,
                'products' => ['9-pm', '9-pm-rebel', '9-pm-elixir', '9-pm-night-out'],
            ],
        ];

        $productIds = Product::pluck('id', 'slug');  // [slug1 => id1, ...]

        foreach ($offers as $index => $offer) {
            $model = Offer::updateOrCreate(
                ['slug' => $offer['slug']],
                [
                    'product_id' => $productIds[$offer['slug']], // the set
                    'title' => $offer['title'],
                    'tagline' => $offer['tagline'],
                    'description' => $offer['description'],
                    'image_path' => $this->copyImage($offer['image']),
                    'terms' => $terms,
                    'starts_at' => now()->addDays($offer['starts'])->setTime(23, 59, 59),
                    'ends_at' => now()->addDays($offer['ends'])->setTime(23, 59, 59),
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );

            // the perfumes inside the set, and the free one if there is one
            $contents = [];
            foreach ($offer['products'] as $slug) {
                $contents[$productIds[$slug]] = ['is_free' => false];
            }
            if (isset($offer['free_product'])) {
                $contents[$productIds[$offer['free_product']]] = ['is_free' => true];
            }

            $model->products()->sync($contents);
        }
    }
}
