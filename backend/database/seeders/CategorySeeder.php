<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Floral',   'slug' => 'floral',   'description' => 'Rose, jasmine and peony compositions.', 'sort_order' => 1],
            ['name' => 'Oriental', 'slug' => 'oriental', 'description' => 'Warm amber, oud and spice.',            'sort_order' => 2],
            ['name' => 'Woody',    'slug' => 'woody',    'description' => 'Cedar, sandalwood and vetiver.',        'sort_order' => 3],
            ['name' => 'Fresh',    'slug' => 'fresh',    'description' => 'Citrus and aquatic notes.',             'sort_order' => 4],
        ];

        foreach($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
