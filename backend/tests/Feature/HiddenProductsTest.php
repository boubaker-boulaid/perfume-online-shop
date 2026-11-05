<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class HiddenProductsTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    public function test_hidden_products_are_not_listed(): void
    {
        $visible = Product::factory()->create();
        Product::factory()->inactive()->create();

        $this->getJson('/api/v1/products')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_hidden_products_can_not_be_found_by_searching(): void
    {
        Product::factory()->inactive()->create(['name' => 'Secret Launch']);

        $this->getJson('/api/v1/products?q=Secret')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_a_hidden_product_page_returns_not_found(): void
    {
        $hidden = Product::factory()->inactive()->create();

        $this->getJson("/api/v1/products/{$hidden->slug}")->assertNotFound();
    }

    public function test_hidden_products_are_not_featured(): void
    {
        $visible = Product::factory()->featured()->create();
        Product::factory()->featured()->inactive()->create();

        $this->getJson('/api/v1/products/featured')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id);
    }

    public function test_hidden_products_can_not_be_ordered(): void
    {
        Queue::fake();
        $hidden = Product::factory()->inactive()->create(['stock' => 10]);

        $this->postJson('/api/v1/orders', $this->orderPayload([
            ['product_id' => $hidden->id, 'quantity' => 1],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $hidden->fresh()->stock);
    }

    // the catalog is cached: hiding a product must take effect right away, not when the cache expires
    public function test_hiding_a_product_removes_it_from_the_cached_catalog(): void
    {
        $product = Product::factory()->featured()->create();

        $this->getJson('/api/v1/products')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/products/featured')->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/products/{$product->slug}")->assertOk();

        $product->update(['is_active' => false]);

        $this->getJson('/api/v1/products')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/products/featured')->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/products/{$product->slug}")->assertNotFound();
    }

    public function test_hidden_categories_are_not_listed(): void
    {
        $visible = Category::factory()->create();
        Category::factory()->inactive()->create();

        $this->getJson('/api/v1/categories')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id);
    }

    public function test_hiding_a_category_removes_it_from_the_cached_list(): void
    {
        $category = Category::factory()->create();

        $this->getJson('/api/v1/categories')->assertJsonCount(1, 'data');

        $category->update(['is_active' => false]);

        $this->getJson('/api/v1/categories')->assertJsonCount(0, 'data');
    }

    public function test_admins_can_still_see_hidden_products(): void
    {
        $hidden = Product::factory()->inactive()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/v1/admin/products')->assertOk()
            ->assertJsonPath('data.0.id', $hidden->id);
        $this->getJson("/api/v1/admin/products/{$hidden->slug}")->assertOk();
    }

    public function test_products_in_a_hidden_category_stay_out_of_public_endpoints(): void
    {
        $hiddenCategory = Category::factory()->inactive()->create();
        $product = Product::factory()->for($hiddenCategory)->featured()->create(['name' => 'Secret Launch']);

        $this->getJson('/api/v1/products')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/products?q=Secret')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/products/featured')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/products/{$product->slug}")->assertNotFound();
    }

    public function test_products_in_a_hidden_category_can_not_be_ordered(): void
    {
        Queue::fake();
        $product = Product::factory()->for(Category::factory()->inactive())->create(['stock' => 10]);

        $this->postJson('/api/v1/orders', $this->orderPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_hiding_a_category_removes_its_products_from_the_cached_catalog(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->featured()->create();

        $this->getJson('/api/v1/products')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/products/featured')->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/products/{$product->slug}")->assertOk();

        $category->update(['is_active' => false]);

        $this->getJson('/api/v1/products')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/products/featured')->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/products/{$product->slug}")->assertNotFound();
    }

    public function test_the_public_product_count_leaves_out_hidden_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create();
        Product::factory()->for($category)->inactive()->create();

        $this->getJson('/api/v1/categories')->assertJsonPath('data.0.products_count', 1);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/v1/admin/categories')->assertJsonPath('data.0.products_count', 2);
    }

    public function test_only_admins_can_filter_by_a_hidden_category(): void
    {
        $hiddenCategory = Category::factory()->inactive()->create();
        $product = Product::factory()->for($hiddenCategory)->create();

        $this->getJson("/api/v1/products?category={$hiddenCategory->slug}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category');

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson("/api/v1/admin/products?category={$hiddenCategory->slug}")->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $product->id);
    }
}
