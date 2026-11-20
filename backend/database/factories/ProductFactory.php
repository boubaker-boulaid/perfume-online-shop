<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => Str::title(fake()->unique()->words(2, true)),
            'slug' => fn (array $attributes) => Str::slug($attributes['name']),
            'description' => fake()->sentence(),
            'notes' => implode(', ', fake()->words(3)),
            'sku' => fake()->bothify('PRF-??-###'),
            'price' => fake()->randomFloat(2, 100, 2000),
            'compare_at_price' => null,
            'stock' => fake()->numberBetween(10, 100),
            'image_path' => fn (array $attributes) => "products/{$attributes['slug']}.jpg",
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
        ]);
    }

    // compare_at_price is the old price, shown next to the current one as a discount
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'compare_at_price' => round($attributes['price'] * 1.25, 2),
        ]);
    }
}
