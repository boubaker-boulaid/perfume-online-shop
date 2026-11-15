<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Override;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\BuildsOffers;
use Tests\TestCase;

// the rest of the suite uses the array store, which never serializes anything.
// these tests use the database store, so a cached answer really goes through unserialize
class CatalogCacheTest extends TestCase
{
    use BuildsOffers, RefreshDatabase;

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        config(['cache.default' => 'database']);
        app('cache')->forgetDriver('database');
        app('cache')->setDefaultDriver('database');
        Cache::clearResolvedInstances();
    }

    public static function catalogEndpoints(): array
    {
        return [
            'product list' => ['/api/v1/products'],
            'product list with filters' => ['/api/v1/products?category=woody&sort=price_asc'],
            'product page' => ['/api/v1/products/velvet-oud'],
            'categories' => ['/api/v1/categories'],
        ];
    }

    #[DataProvider('catalogEndpoints')]
    public function test_a_cached_answer_is_the_same_as_a_fresh_one(string $url): void
    {
        $this->seedCatalog();

        $fresh = $this->getJson($url)->assertOk();
        $cached = $this->getJson($url)->assertOk();

        $this->assertSame($fresh->json('data'), $cached->json('data'));
        $this->assertSame($fresh->json('links'), $cached->json('links'));
    }

    public function test_cached_featured_products_still_work(): void
    {
        $this->seedCatalog();

        $this->getJson('/api/v1/products/featured')->assertOk();
        $this->getJson('/api/v1/products/featured')->assertOk()->assertJsonCount(1, 'data');
    }

    // the offers come with their set, perfumes and pivot rows: all of it must survive unserialize
    public function test_a_cached_offers_list_is_the_same_as_a_fresh_one(): void
    {
        $this->makeOffer(free: Product::factory()->create());

        $fresh = $this->getJson('/api/v1/offers')->assertOk();
        $cached = $this->getJson('/api/v1/offers')->assertOk();

        $this->assertSame($fresh->json('data'), $cached->json('data'));
        $this->assertNotNull($cached->json('data.0.free_product'));
    }

    private function seedCatalog(): void
    {
        $category = Category::factory()->create(['slug' => 'woody', 'is_active' => true]);

        Product::factory()->create([
            'category_id' => $category->id,
            'slug' => 'velvet-oud',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }
}
