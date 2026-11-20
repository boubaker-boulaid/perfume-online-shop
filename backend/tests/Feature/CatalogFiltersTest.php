<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_pagination_links_keep_the_filters(): void
    {
        $category = Category::factory()->create(['slug' => 'woody', 'is_active' => true]);
        Product::factory()->count(11)->create(['category_id' => $category->id, 'is_active' => true]);

        $next = $this->getJson('/api/v1/products?category=woody&sort=price_asc')->assertOk()->json('links.next');

        $this->assertStringContainsString('category=woody', $next);
        $this->assertStringContainsString('sort=price_asc', $next);
        $this->assertStringContainsString('page=2', $next);
    }

    public function test_unknown_parameters_stay_out_of_the_links(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->count(11)->create(['category_id' => $category->id, 'is_active' => true]);

        $next = $this->getJson('/api/v1/products?junk=evil')->assertOk()->json('links.next');

        $this->assertStringNotContainsString('junk', $next);
    }

    public function test_admin_order_links_keep_the_filters(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Order::factory()->count(11)->create(['status' => 'pending']);

        $next = $this->getJson('/api/v1/admin/orders?status=pending')->assertOk()->json('links.next');

        $this->assertStringContainsString('status=pending', $next);
    }

    public function test_a_price_filter_of_zero_is_applied(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->create(['category_id' => $category->id, 'is_active' => true, 'price' => '0.00']);
        Product::factory()->create(['category_id' => $category->id, 'is_active' => true, 'price' => '50.00']);

        $this->getJson('/api/v1/products?max_price=0')->assertOk()->assertJsonPath('meta.total', 1);
    }
}
