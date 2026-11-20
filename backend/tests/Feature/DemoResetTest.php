<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Storage;
use Override;
use Tests\TestCase;

// migrate:fresh changes the tables, which can't happen inside RefreshDatabase's transaction,
// so these tests migrate their own database instead
class DemoResetTest extends TestCase
{
    use DatabaseMigrations;

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        config([
            'shop.admin.name' => 'Démo',
            'shop.admin.email' => 'demo@example.com',
            'shop.admin.password' => 'demo-password',
        ]);
    }

    public function test_nothing_is_reset_when_demo_mode_is_off(): void
    {
        config(['shop.demo' => false]);
        $product = Product::factory()->create();

        $this->artisan('shop:demo-reset')->assertFailed();

        $this->assertModelExists($product);
        $this->assertSame(0, Offer::count());
    }

    public function test_the_demo_starts_again_from_the_seeded_catalog(): void
    {
        config(['shop.demo' => true]);
        $visitorProduct = Product::factory()->create(['name' => 'Ajouté par un visiteur']);

        $this->artisan('shop:demo-reset')
            ->expectsOutputToContain('demo@example.com')
            ->assertSuccessful();

        $this->assertDatabaseMissing('products', ['name' => $visitorProduct->name]);
        $this->assertGreaterThan(0, Product::count());
        $this->assertGreaterThan(0, Offer::count());
        $this->assertSame(0, Order::count());
        $this->assertTrue(User::where('email', 'demo@example.com')->where('is_admin', true)->exists());
    }
}
