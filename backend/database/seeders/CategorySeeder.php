<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    use CopiesSeedImages;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // the shop's categories, with their French names and images
        $categories = [
            ['name' => 'Floral',   'slug' => 'floral',   'description' => 'Rose, jasmin, fleurs blanches. Doux et féminin.',     'image' => 'categories/floral.webp',   'sort_order' => 1],
            ['name' => 'Oriental', 'slug' => 'oriental', 'description' => 'Oud, ambre et épices. Ça tient toute la journée.',     'image' => 'categories/oriental.webp', 'sort_order' => 2],
            ['name' => 'Boisé',    'slug' => 'woody',    'description' => 'Cèdre, santal, vétiver. Chaud et élégant.',           'image' => 'categories/woody.webp',    'sort_order' => 3],
            ['name' => 'Frais',    'slug' => 'fresh',    'description' => 'Agrumes et notes marines. Parfait pour l’été.',        'image' => 'categories/fresh.webp',    'sort_order' => 4],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'image_path' => $this->copyImage($category['image']),
                    'is_active' => true,
                    'sort_order' => $category['sort_order'],
                ]
            );
        }
    }
}
