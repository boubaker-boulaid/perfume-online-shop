<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());
    }

    public function test_creating_a_product_returns_its_saved_defaults(): void
    {
        $category = Category::factory()->create();

        $this->post('/api/v1/admin/products', [
            'category_id' => $category->id,
            'name' => 'Oud Royal',
            'price' => '250.00',
            'stock' => 5,
            'image' => UploadedFile::fake()->image('oud.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.is_featured', false)
            ->assertJsonPath('data.sort_order', 0);
    }

    public function test_creating_a_category_returns_its_saved_defaults(): void
    {
        $this->postJson('/api/v1/admin/categories', ['name' => 'Woody'])
            ->assertCreated()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.sort_order', 0);
    }

    public function test_the_old_price_can_be_changed_on_its_own(): void
    {
        $product = Product::factory()->create(['price' => '250.00']);

        $this->patchJson("/api/v1/admin/products/{$product->slug}", ['compare_at_price' => '300.00'])
            ->assertOk()
            ->assertJsonPath('data.compare_at_price', '300.00');
    }

    public function test_the_old_price_must_be_above_the_current_price(): void
    {
        $product = Product::factory()->create(['price' => '250.00']);

        $this->patchJson("/api/v1/admin/products/{$product->slug}", ['compare_at_price' => '200.00'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('compare_at_price');

        $this->assertNull($product->fresh()->compare_at_price);
    }

    public function test_the_old_price_is_compared_with_a_new_price_sent_with_it(): void
    {
        $product = Product::factory()->create(['price' => '250.00']);

        // below the current price, but above the new one
        $this->patchJson("/api/v1/admin/products/{$product->slug}", ['price' => '100.00', 'compare_at_price' => '200.00'])
            ->assertOk();

        // above the current price, but below the new one
        $this->patchJson("/api/v1/admin/products/{$product->slug}", ['price' => '500.00', 'compare_at_price' => '300.00'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('compare_at_price');
    }

    public function test_products_are_listed_by_sort_order_when_no_sort_is_chosen(): void
    {
        $second = Product::factory()->create(['sort_order' => 2]);
        $first = Product::factory()->create(['sort_order' => 1]);
        $third = Product::factory()->create(['sort_order' => 3]);

        foreach (['/api/v1/products', '/api/v1/admin/products'] as $url) {
            $this->assertSame(
                [$first->id, $second->id, $third->id],
                array_column($this->getJson($url)->json('data'), 'id'),
            );
        }
    }

    public function test_choosing_a_sort_overrides_the_sort_order(): void
    {
        $cheap = Product::factory()->create(['sort_order' => 2, 'price' => '10.00']);
        $expensive = Product::factory()->create(['sort_order' => 1, 'price' => '20.00']);

        $this->assertSame(
            [$cheap->id, $expensive->id],
            array_column($this->getJson('/api/v1/products?sort=price_asc')->json('data'), 'id'),
        );
    }

    public function test_categories_are_listed_by_sort_order(): void
    {
        $second = Category::factory()->create(['sort_order' => 2]);
        $first = Category::factory()->create(['sort_order' => 1]);

        foreach (['/api/v1/categories', '/api/v1/admin/categories'] as $url) {
            $this->assertSame(
                [$first->id, $second->id],
                array_column($this->getJson($url)->json('data'), 'id'),
            );
        }
    }

    public function test_an_empty_sort_order_falls_back_to_the_default(): void
    {
        $this->postJson('/api/v1/admin/categories', ['name' => 'Woody', 'sort_order' => null])
            ->assertCreated()
            ->assertJsonPath('data.sort_order', 0);

        $this->post('/api/v1/admin/products', $this->productFields(['sort_order' => null]), ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.sort_order', 0);
    }

    public function test_numbers_too_big_for_the_database_are_refused(): void
    {
        $this->post('/api/v1/admin/products', $this->productFields(['price' => '100000000.00', 'stock' => 2147483648]), ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['price', 'stock'], 'errors');
    }

    private function productFields(array $extra = []): array
    {
        return [
            'category_id' => Category::factory()->create()->id,
            'name' => 'Oud Royal',
            'price' => '250.00',
            'stock' => 5,
            'image' => UploadedFile::fake()->image('oud.jpg'),
            ...$extra,
        ];
    }
}
