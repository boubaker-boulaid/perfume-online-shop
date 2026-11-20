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

    public function test_the_dashboard_returns_each_of_its_numbers(): void
    {
        Order::factory()->confirmed()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/v1/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.orders_by_status.confirmed', 1)
            ->assertJsonMissingPath('data.pending_over_24h')
            ->assertJsonStructure(['data' => ['revenue_this_month', 'orders_by_status', 'revenue_last_30_days', 'top_products', 'low_stock']]);
    }

    // the dashboard can't list orders pending for over 24h, because the scheduler cancels them at that point
    public function test_an_order_pending_for_24_hours_is_cancelled(): void
    {
        $order = Order::factory()->create(['status' => 'pending', 'whatsapp_opened_at' => now()->subHours(25), 'created_at' => now()->subHours(25)]);

        $this->artisan('orders:cancel-unpaid', ['--hours' => 24]);

        $this->assertSame('cancelled', $order->fresh()->status);
    }
}
