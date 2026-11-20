<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // same format as OrderService, but numbered from the top of the range: the real
            // sequence starts at 1, so an order placed through the API can never collide with these
            'order_number' => sprintf('ORD-%d-%06d', now()->year, fake()->unique()->numberBetween(900000, 999999)),
            'idempotency_key' => (string) Str::uuid(),
            'customer_name' => fake()->name(),
            'phone' => fake()->numerify('+2126########'),
            'email' => fake()->safeEmail(),
            'city' => fake()->randomElement(['Agadir', 'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes']),
            'address' => fake()->streetAddress(),
            'note' => null,
            'subtotal' => fake()->randomFloat(2, 100, 2000),
            'shipping_cost' => 0,
            'total' => fn (array $attributes) => round($attributes['subtotal'] + $attributes['shipping_cost'], 2),
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'shipped',
        ]);
    }

    // cash on delivery: delivered means the money was collected
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'payment_status' => 'paid',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    // adds items, then sets subtotal and total from them so the order adds up
    public function withItems(int $count = 1): static
    {
        return $this->afterCreating(function (Order $order) use ($count) {
            OrderItem::factory()->count($count)->for($order)->create();

            $subtotal = round((float) $order->items()->sum('line_total'), 2);

            $order->update([
                'subtotal' => $subtotal,
                'total' => round($subtotal + (float) $order->shipping_cost, 2),
            ]);
        });
    }
}
