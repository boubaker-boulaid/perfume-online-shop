<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_over_24h_only_lists_orders_older_than_24_hours(): void
    {
        $tooRecent = Order::factory()->create(['created_at' => now()->subHours(23)->subMinutes(30)]);
        $overdue = Order::factory()->create(['created_at' => now()->subHours(25)]);
        Order::factory()->confirmed()->create(['created_at' => now()->subHours(48)]);

        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->getJson('/api/v1/admin/stats')->assertOk();

        $this->assertSame(
            [$overdue->order_number],
            array_column($response->json('data.pending_over_24h'), 'order_number'),
        );
        $this->assertNotContains($tooRecent->order_number, array_column($response->json('data.pending_over_24h'), 'order_number'));
    }
}
