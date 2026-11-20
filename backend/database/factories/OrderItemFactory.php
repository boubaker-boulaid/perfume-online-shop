<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            // name and price are copied from the product, like at purchase time
            'product_name' => fn (array $attributes) => Product::find($attributes['product_id'])?->name
                ?? Str::title(fake()->words(2, true)),
            'unit_price' => fn (array $attributes) => Product::find($attributes['product_id'])?->price
                ?? fake()->randomFloat(2, 100, 2000),
            'quantity' => fake()->numberBetween(1, 3),
            'line_total' => fn (array $attributes) => round($attributes['unit_price'] * $attributes['quantity'], 2),
        ];
    }

    // the product was deleted after the purchase (product_id is set to null, the copies stay)
    public function withoutProduct(): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => null,
        ]);
    }
}
