<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitors_who_are_not_logged_in_are_refused(): void
    {
        $product = Product::factory()->create();

        foreach ($this->adminEndpoints() as [$method, $url]) {
            $this->json($method, $url)->assertUnauthorized();
        }

        $this->assertModelExists($product);
    }

    public function test_an_invalid_token_is_refused(): void
    {
        $this->withToken('not-a-real-token')->getJson('/api/v1/admin/stats')->assertUnauthorized();
    }

    public function test_logged_in_users_who_are_not_admins_are_refused(): void
    {
        $product = Product::factory()->create();

        Sanctum::actingAs(User::factory()->create());

        foreach ($this->adminEndpoints() as [$method, $url]) {
            $this->json($method, $url)->assertForbidden();
        }

        $this->assertModelExists($product);
    }

    public function test_admins_are_let_in(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/me')->assertOk()
            ->assertJsonPath('email', $admin->email)
            ->assertJsonMissingPath('password');
        $this->getJson('/api/v1/admin/stats')->assertOk();
        $this->getJson('/api/v1/admin/orders')->assertOk();
        $this->getJson('/api/v1/admin/products')->assertOk();
        $this->getJson('/api/v1/admin/categories')->assertOk();
    }

    /**
     * Every route under /api/v1/admin, read from the router: an admin route added later
     * is covered without touching this file. Uses real records, so a refusal can't be
     * mistaken for a 404 and the middleware is what actually gets tested.
     *
     * @return array<int, array{string, string}>
     */
    private function adminEndpoints(): array
    {
        $params = [
            '{product}' => Product::factory()->create()->slug,
            '{category}' => Category::factory()->create()->slug,
            '{order}' => Order::factory()->create()->order_number,
        ];

        $endpoints = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route) => str_starts_with($route->uri(), 'api/v1/admin/'))
            ->map(fn ($route) => [$route->methods()[0], '/'.strtr($route->uri(), $params)])
            ->values()
            ->all();

        // guards against the filter above matching nothing, which would make the tests pass without checking anything
        $this->assertGreaterThanOrEqual(15, count($endpoints));

        return $endpoints;
    }
}
