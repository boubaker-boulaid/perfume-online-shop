<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'category' => 'floral',
                'name' => 'Celestial Rose',
                'slug' => 'celestial-rose',
                'description' => 'A luminous rose accord lifted by bergamot and dusted with musk.',
                'notes' => 'Bergamot, Damask Rose, White Musk',
                'sku' => 'PRF-CR-050',
                'price' => 890.00,
                'compare_at_price' => 1100.00,
                'stock' => 25,
                'is_featured' => true,
                'sort_order' => 1,
                'image' => 'celestial_rose.jpg',
            ],
            [
                'category' => 'oriental',
                'name' => 'Velvet Oud',
                'slug' => 'velvet-oud',
                'description' => 'Dense oud wrapped in saffron and warm amber.',
                'notes' => 'Saffron, Oud, Amber',
                'sku' => 'PRF-VO-050',
                'price' => 1450.00,
                'compare_at_price' => null,
                'stock' => 12,
                'is_featured' => true,
                'sort_order' => 2,
                'image' => 'velvet_oud.jpg',
            ],
            [
                'category' => 'woody',
                'name' => 'Noir Absolute',
                'slug' => 'noir-absolute',
                'description' => 'Smoked cedar and leather over a vetiver base.',
                'notes' => 'Black Pepper, Cedar, Leather, Vetiver',
                'sku' => 'PRF-NA-050',
                'price' => 1200.00,
                'compare_at_price' => 1400.00,
                'stock' => 18,
                'is_featured' => false,
                'sort_order' => 3,
                'image' => 'noir_absolute.jpg',
            ],
            [
                'category' => 'fresh',
                'name' => 'Ether Solace',
                'slug' => 'ether-solace',
                'description' => 'Crisp citrus and sea salt drying down to clean woods.',
                'notes' => 'Lemon, Sea Salt, Driftwood',
                'sku' => 'PRF-ES-050',
                'price' => 760.00,
                'compare_at_price' => null,
                'stock' => 40,
                'is_featured' => false,
                'sort_order' => 4,
                'image' => 'ether_solace.jpg',
            ],
        ];
        
        $categoryIds = Category::pluck('id', 'slug');  //pluck returns an array like this [slug1 => id1, ...]

        foreach ($products as $product) {
            $imagePath = $this->copyImage($product['image']);
            Product::updateOrCreate(
                ['slug' => $product['slug']],
                [
                    'category_id' => $categoryIds[$product['category']],
                    'name' => $product['name'],
                    'description' => $product['description'],
                    'notes' => $product['notes'],
                    'sku' => $product['sku'],
                    'price' => $product['price'],
                    'compare_at_price' => $product['compare_at_price'],
                    'stock' => $product['stock'],
                    'sort_order' => $product['sort_order'],
                    'image_path' => $imagePath,
                    'is_active' => true,
                    'is_featured' => $product['is_featured'],                   
                ]
            );
        }
    }

    private function copyImage(string $imageName):string
    {
        $newPath = 'pruducts/'. $imageName; // storage/app/public/products/imageName.jpg
        $imageSource = database_path('seeders/assets/pr-images/'. $imageName);

        if (! is_file($imageSource)){
            throw new RuntimeException('seed image missing: '. $imageName);
        }

        Storage::disk('public')->put($newPath, file_get_contents($imageSource));

        return $newPath;
    }
}
