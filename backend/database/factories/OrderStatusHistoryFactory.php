<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
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
            'user_id' => null, // null means the system did it, not an admin
            'from_status' => 'pending',
            'to_status' => 'confirmed',
            'note' => null,
        ];
    }
}
