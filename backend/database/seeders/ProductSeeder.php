<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProductSeeder extends Seeder
{
    use CopiesSeedImages;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // the shop's products, in the order of their ids and SKUs
        // left out keys use the defaults below: stock 25, active, not featured, not an offer set
        // a product without a description or notes has none yet: nothing is made up
        $products = [
            ['name' => 'L’Interdit', 'slug' => 'l-interdit', 'category' => 'floral', 'image' => 'products/l-interdit.webp', 'price' => '178.00', 'description' => 'Sucré et fleuri, avec une touche d’amande. Un parfum doux qu’on porte tous les jours.', 'notes' => 'Poire, Amande, Fleurs blanches', 'featured' => true],
            ['name' => 'Sauvage', 'slug' => 'sauvage', 'category' => 'woody', 'image' => 'products/sauvage.webp', 'price' => '190.00', 'compare' => '240.00', 'description' => 'Boisé et un peu fumé. Pour homme, idéal le soir.', 'notes' => 'Poivre noir, Cèdre, Cuir', 'featured' => true],
            ['name' => 'Smoke for the Soul', 'slug' => 'smoke-for-the-soul', 'category' => 'oriental', 'image' => 'products/smoke-for-the-soul.webp', 'price' => '176.00', 'description' => 'Un bouquet de fleurs blanches, frais et féminin. Très demandé en cadeau.', 'notes' => 'Tubéreuse, Jasmin, Fleurs blanches', 'featured' => true],
            ['name' => 'Chic for Men', 'slug' => 'chic-for-men', 'category' => 'fresh', 'image' => 'products/chic-for-men.webp', 'price' => '164.00', 'compare' => '200.00', 'description' => 'Un musc propre et léger, comme du linge frais. Discret et agréable.', 'notes' => 'Bergamote, Thé blanc, Musc', 'featured' => true],
            ['name' => 'Coco Mademoiselle', 'slug' => 'coco-mademoiselle', 'category' => 'oriental', 'image' => 'products/coco-mademoiselle.webp', 'price' => '220.00', 'description' => 'Un oud fort avec du safran. Il tient toute la journée et on le remarque.', 'notes' => 'Safran, Oud, Benjoin', 'featured' => true],
            ['name' => 'Lunar L', 'slug' => 'lunar-l', 'category' => 'floral', 'image' => 'products/lunar-l.webp', 'price' => '198.00', 'compare' => '240.00', 'description' => 'Un parfum fort qui tient longtemps sur la peau.', 'notes' => 'Rose, Pivoine, Santal'],
            ['name' => 'Kayali Vanilla 28', 'slug' => 'kayali-vanilla-28', 'category' => 'woody', 'image' => 'products/kayali-black.webp', 'price' => '250.00', 'compare' => '320.00', 'description' => 'Une vanille chaude et gourmande. Doux sans être trop sucré.', 'notes' => 'Vanille, Ambre, Fève tonka'],
            ['name' => 'Manifesto', 'slug' => 'manifesto', 'category' => 'oriental', 'image' => 'products/manifesto.webp', 'price' => '270.00', 'compare' => '340.00', 'description' => 'Chaud et épicé, pour les soirées et l’hiver.', 'notes' => 'Cardamome, Ambre, Vanille', 'sort_order' => 99],
            ['name' => 'Kayali Maldives in a Bottle', 'slug' => 'kayali-maldives-in-a-bottle', 'category' => 'fresh', 'image' => 'products/kayali-blue.webp', 'price' => '172.00', 'compare' => '220.00', 'stock' => 3, 'description' => 'Frais et fruité, ça sent les vacances. Parfait pour l’été.', 'notes' => 'Fruits exotiques, Notes marines, Musc'],
            ['name' => 'Baccarat Rouge 540', 'slug' => 'baccarat-rouge-540', 'category' => 'oriental', 'image' => 'products/baccarat-rouge.webp', 'price' => '300.00', 'compare' => '350.00', 'description' => 'Ambré et un peu sucré, avec un sillage qu’on reconnaît tout de suite.', 'notes' => 'Safran, Jasmin, Ambre, Cèdre'],
            ['name' => 'Kayali Yum Marshmallow', 'slug' => 'kayali-yum-marshmallow', 'category' => 'floral', 'image' => 'products/kayali-red.webp', 'price' => '156.00', 'compare' => '200.00', 'description' => 'Gourmand et sucré, comme un bonbon. Très apprécié par les jeunes.', 'notes' => 'Guimauve, Vanille, Fruits rouges'],
            // inactive: it never appears in the shop
            ['name' => 'Celestial Rose', 'slug' => 'celestial-rose', 'category' => 'floral', 'image' => 'products/bloom.webp', 'price' => '280.00', 'active' => false, 'description' => 'Pas encore disponible.', 'notes' => 'Rose'],
            ['name' => 'Flair', 'slug' => 'flair', 'category' => 'oriental', 'image' => 'products/flair.webp', 'price' => '120.00', 'description' => 'Chaud et lumineux, de la collection Gissah.', 'notes' => 'Safran, Rose, Ambre'],
            ['name' => 'La Luna', 'slug' => 'la-luna', 'category' => 'oriental', 'image' => 'products/la-luna.webp', 'price' => '120.00', 'description' => 'Ambré et doux, de la collection Gissah.', 'notes' => 'Ambre, Vanille, Santal'],
            ['name' => 'Legend of the Sky', 'slug' => 'legend-of-the-sky', 'category' => 'floral', 'image' => 'products/legend-of-the-sky.webp', 'price' => '120.00', 'description' => 'Floral et léger, de la collection Gissah.', 'notes' => 'Pivoine, Rose, Musc'],
            ['name' => 'Imperial Valley', 'slug' => 'imperial-valley', 'category' => 'fresh', 'image' => 'products/imperial-valley.webp', 'price' => '120.00', 'description' => 'Frais et doux, de la collection Gissah.', 'notes' => 'Bergamote, Thé blanc, Musc'],
            ['name' => 'Kayali Eden Juicy Apple', 'slug' => 'kayali-eden-juicy-apple', 'category' => 'fresh', 'image' => 'products/kayali-eden.webp', 'price' => '190.00', 'description' => 'Fruité et pétillant, avec beaucoup de pomme.', 'notes' => 'Pomme, Poire, Musc'],
            ['name' => '9 PM', 'slug' => '9-pm', 'category' => 'woody', 'image' => 'products/9-pm.webp', 'price' => '130.00', 'description' => 'Le classique de la collection 9 PM. Sucré et chaud, pour homme.', 'notes' => 'Pomme, Lavande, Vanille'],
            ['name' => '9 PM Rebel', 'slug' => '9-pm-rebel', 'category' => 'woody', 'image' => 'products/9-pm-rebel.webp', 'price' => '130.00', 'description' => 'Plus fort et plus boisé que le 9 PM classique.', 'notes' => 'Cuir, Poivre, Cèdre'],
            ['name' => '9 PM Elixir', 'slug' => '9-pm-elixir', 'category' => 'oriental', 'image' => 'products/9-pm-elixir.webp', 'price' => '130.00', 'description' => 'Le plus chaud de la collection, avec du oud.', 'notes' => 'Cannelle, Ambre, Oud'],
            ['name' => '9 PM Night Out', 'slug' => '9-pm-night-out', 'category' => 'woody', 'image' => 'products/9-pm-night-out.webp', 'price' => '130.00', 'description' => 'Pour sortir le soir. Épicé et un peu sucré.', 'notes' => 'Poivre noir, Patchouli, Vanille'],
            // the offers' fixed-price sets: each one is sold as one product, has its offer's slug,
            // and is only shown on its offer's page (OfferSeeder links them)
            ['name' => 'Pack 5 parfums + 1 offert', 'slug' => '5-parfums-199-dh', 'category' => 'oriental', 'image' => 'offers/5-parfums-199-dh.webp', 'price' => '199.00', 'offer' => true, 'description' => 'L’Interdit, Smoke for the Soul, Chic for Men, Manifesto, Baccarat Rouge 540 + Coco Mademoiselle offert', 'notes' => ''],
            ['name' => 'Pack Gissah, 4 parfums', 'slug' => 'collection-gissah', 'category' => 'oriental', 'image' => 'offers/collection-gissah.webp', 'price' => '180.00', 'offer' => true, 'description' => 'Flair, La Luna, Legend of the Sky, Imperial Valley', 'notes' => ''],
            ['name' => 'Pack Kayali, 4 parfums', 'slug' => 'collection-kayali', 'category' => 'oriental', 'image' => 'offers/collection-kayali.webp', 'price' => '180.00', 'offer' => true, 'description' => 'Kayali Vanilla 28, Kayali Eden Juicy Apple, Kayali Maldives in a Bottle, Kayali Yum Marshmallow', 'notes' => ''],
            ['name' => 'Pack 9 PM, 4 parfums', 'slug' => 'collection-9-pm', 'category' => 'woody', 'image' => 'offers/collection-9-pm.webp', 'price' => '180.00', 'offer' => true, 'description' => '9 PM, 9 PM Rebel, 9 PM Elixir, 9 PM Night Out', 'notes' => ''],
            // the home page carousel's bottles: their categories and prices are placeholders,
            // and the shop hasn't written their description and notes yet
            ['name' => 'Noir Pour Homme', 'slug' => 'noir-pour-homme', 'category' => 'woody', 'image' => 'products/noir-pour-homme.webp', 'price' => '170.00'],
            ['name' => 'Bleu de Chanel', 'slug' => 'bleu-de-chanel', 'category' => 'woody', 'image' => 'products/bleu-de-chanel.webp', 'price' => '240.00'],
            ['name' => 'Miss Dior', 'slug' => 'miss-dior', 'category' => 'floral', 'image' => 'products/miss-dior.webp', 'price' => '220.00'],
            ['name' => 'Noir L’Eau de Parfum', 'slug' => 'noir-l-eau-de-parfum', 'category' => 'oriental', 'image' => 'products/noir-l-eau-de-parfum.webp', 'price' => '190.00'],
            ['name' => 'Noir Eau de Parfum', 'slug' => 'noir-eau-de-parfum', 'category' => 'floral', 'image' => 'products/noir-eau-de-parfum-rose.webp', 'price' => '180.00'],
            ['name' => 'Yves Saint Laurent', 'slug' => 'yves-saint-laurent', 'category' => 'oriental', 'image' => 'products/yves-saint-laurent.webp', 'price' => '260.00'],
        ];

        $categoryIds = Category::pluck('id', 'slug');  // pluck returns an array like this [slug1 => id1, ...]

        foreach ($products as $index => $product) {
            $number = $index + 1; // the product's place in the list, used for its SKU and sort order

            $model = Product::firstOrNew(['slug' => $product['slug']]);
            $model->fill([
                'category_id' => $categoryIds[$product['category']],
                'name' => $product['name'],
                'description' => $product['description'] ?? null,
                'notes' => $product['notes'] ?? null,
                'sku' => sprintf('PRF-%03d-050', $number),
                'price' => $product['price'],
                'compare_at_price' => $product['compare'] ?? null,
                'stock' => $product['stock'] ?? 25,
                'sort_order' => $product['sort_order'] ?? $number,
                'image_path' => $this->copyImage($product['image']),
                'is_active' => $product['active'] ?? true,
                'is_featured' => $product['featured'] ?? false,
                'is_offer' => $product['offer'] ?? false,
            ]);
            // one day apart from 1 October 2026, so "newest" lists them in a fixed order
            // (created_at isn't fillable, so it is set on its own)
            $model->created_at = Carbon::create(2026, 10, 1, 0, 0, 0, 'UTC')->addDays($index);
            $model->save();
        }
    }
}
