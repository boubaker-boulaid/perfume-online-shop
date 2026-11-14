<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsOffers;
use Tests\TestCase;

// what customers see of the offers, and the sets staying out of the normal shop
class PublicOffersTest extends TestCase
{
    use BuildsOffers, RefreshDatabase;

    private const ENDPOINT = '/api/v1/offers';

    public function test_offers_list_only_shows_current_offers(): void
    {
        [$current] = $this->makeOffer();
        $this->makeOffer(offer: ['starts_at' => now()->addHour()]);
        $this->makeOffer(offer: ['ends_at' => now()->subHour()]);
        $this->makeOffer(offer: ['is_active' => false]);
        $this->makeOffer(set: ['is_active' => false]);
        $this->makeOffer(set: ['category_id' => Category::factory()->inactive()]);

        $this->getJson(self::ENDPOINT)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $current->id);
    }

    public function test_offers_are_listed_by_sort_order_then_the_soonest_end(): void
    {
        [$last] = $this->makeOffer(offer: ['sort_order' => 2]);
        [$endsLater] = $this->makeOffer(offer: ['sort_order' => 1, 'ends_at' => now()->addDays(5)]);
        [$endsSooner] = $this->makeOffer(offer: ['sort_order' => 1, 'ends_at' => now()->addDays(2)]);

        $this->assertSame(
            [$endsSooner->id, $endsLater->id, $last->id],
            array_column($this->getJson(self::ENDPOINT)->json('data'), 'id'),
        );
    }

    // the shop only runs a few offers at once, and the page shows them all
    public function test_the_offers_list_is_not_paginated(): void
    {
        $this->makeOffer();

        $this->getJson(self::ENDPOINT)
            ->assertOk()
            ->assertJsonMissingPath('meta')
            ->assertJsonMissingPath('links');
    }

    // the Offer type in frontend/src/types.ts
    public function test_an_offer_has_the_shape_the_frontend_expects(): void
    {
        [$offer, $set] = $this->makeOffer(offer: ['tagline' => '4 parfums', 'terms' => ['Dans la limite des stocks']]);

        $this->getJson(self::ENDPOINT)
            ->assertOk()
            ->assertJsonStructure(['data' => [[
                'id', 'slug', 'title', 'tagline', 'description', 'image_path', 'starts_at', 'ends_at',
                'terms', 'set', 'products', 'free_product', 'regular_price', 'saving', 'discount_percent',
            ]]])
            ->assertJsonPath('data.0.slug', $set->slug)
            ->assertJsonPath('data.0.tagline', '4 parfums')
            ->assertJsonPath('data.0.terms', ['Dans la limite des stocks'])
            ->assertJsonPath('data.0.set.id', $set->id)
            ->assertJsonPath('data.0.set.is_offer', true)
            ->assertJsonPath('data.0.starts_at', $offer->starts_at->toISOString())
            ->assertJsonCount(2, 'data.0.products')
            ->assertJsonPath('data.0.free_product', null);

        $this->assertStringEndsWith('/storage/offers/test.webp', $this->getJson(self::ENDPOINT)->json('data.0.image_path'));
    }

    public function test_offers_without_terms_send_an_empty_list(): void
    {
        $this->makeOffer(offer: ['terms' => null]);

        $this->getJson(self::ENDPOINT)->assertJsonPath('data.0.terms', []);
    }

    public function test_offer_totals_are_calculated(): void
    {
        [$offer] = $this->makeOffer([5, 5], set: ['price' => '100.00']);
        $offer->products->each->update(['price' => '60.00']);

        $this->getJson(self::ENDPOINT)
            ->assertJsonPath('data.0.regular_price', '120.00')
            ->assertJsonPath('data.0.saving', '20.00')
            ->assertJsonPath('data.0.discount_percent', 16);
    }

    // the prices are added in cents: 0.10 + 0.20 in floats is 0.30000000000000004
    public function test_offer_totals_have_no_rounding_errors(): void
    {
        [$offer] = $this->makeOffer([5, 5], set: ['price' => '0.20']);
        $offer->products[0]->update(['price' => '0.10']);
        $offer->products[1]->update(['price' => '0.20']);

        $this->getJson(self::ENDPOINT)
            ->assertJsonPath('data.0.regular_price', '0.30')
            ->assertJsonPath('data.0.saving', '0.10')
            ->assertJsonPath('data.0.discount_percent', 33);
    }

    // "5 perfumes + 1 free": the gift is shown apart, and counts in what the customer would have paid
    public function test_the_free_perfume_is_shown_apart_from_the_others(): void
    {
        $free = Product::factory()->create(['price' => '50.00']);
        [$offer] = $this->makeOffer([5], set: ['price' => '100.00'], free: $free);
        $offer->products->firstWhere('id', '!=', $free->id)->update(['price' => '100.00']);

        $this->getJson(self::ENDPOINT)
            ->assertJsonCount(1, 'data.0.products')
            ->assertJsonPath('data.0.free_product.id', $free->id)
            ->assertJsonPath('data.0.regular_price', '150.00')
            ->assertJsonPath('data.0.saving', '50.00');
    }

    public function test_one_current_offer_is_shown_by_its_slug(): void
    {
        [$offer] = $this->makeOffer();

        $this->getJson(self::ENDPOINT."/{$offer->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $offer->id)
            ->assertJsonCount(2, 'data.products');
    }

    public function test_an_offer_that_is_not_current_has_no_page(): void
    {
        [$ended] = $this->makeOffer(offer: ['ends_at' => now()->subHour()]);
        [$off] = $this->makeOffer(offer: ['is_active' => false]);

        $this->getJson(self::ENDPOINT."/{$ended->slug}")->assertNotFound();
        $this->getJson(self::ENDPOINT."/{$off->slug}")->assertNotFound();
        $this->getJson(self::ENDPOINT.'/unknown-offer')->assertNotFound();
    }

    // if listed() is forgotten in one place, the set shows in the shop as a normal perfume at the offer's price
    public function test_sets_are_not_listed_in_the_shop(): void
    {
        [, $set, $inside] = $this->makeOffer(set: ['is_featured' => true]);
        $inside[0]->update(['is_featured' => true]);

        $listed = array_column($this->getJson('/api/v1/products')->json('data'), 'id');
        $this->assertNotContains($set->id, $listed);
        $this->assertContains($inside[0]->id, $listed);

        $this->assertNotContains($set->id, array_column($this->getJson('/api/v1/products/featured')->json('data'), 'id'));
        $this->getJson("/api/v1/products/{$set->slug}")->assertNotFound();
        $this->getJson("/api/v1/products/{$inside[0]->slug}")->assertOk()->assertJsonPath('data.is_offer', false);
    }

    public function test_sets_are_not_counted_in_the_categories(): void
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create();
        $this->makeOffer(set: ['category_id' => $category->id]);

        $this->getJson('/api/v1/categories')
            ->assertJsonPath('data.0.id', $category->id)
            ->assertJsonPath('data.0.products_count', 1);
    }

    // the list is cached: every change the admin makes must show up straight away
    public function test_changes_to_an_offer_show_up_in_the_cached_list(): void
    {
        [$offer] = $this->makeOffer();
        $this->getJson(self::ENDPOINT)->assertJsonPath('data.0.title', 'Collection Gissah');

        $offer->update(['title' => 'Collection Ramadan']);
        $this->getJson(self::ENDPOINT)->assertJsonPath('data.0.title', 'Collection Ramadan');

        $offer->update(['is_active' => false]);
        $this->getJson(self::ENDPOINT)->assertJsonCount(0, 'data');
    }

    public function test_a_deleted_offer_leaves_the_cached_list(): void
    {
        [$offer] = $this->makeOffer();
        $this->getJson(self::ENDPOINT)->assertJsonCount(1, 'data');

        $offer->delete();

        $this->getJson(self::ENDPOINT)->assertJsonCount(0, 'data');
    }

    public function test_a_new_price_of_a_perfume_inside_shows_up_in_the_cached_list(): void
    {
        [$offer] = $this->makeOffer([5], set: ['price' => '100.00']);
        $offer->products[0]->update(['price' => '150.00']);
        $this->getJson(self::ENDPOINT)->assertJsonPath('data.0.regular_price', '150.00');

        $offer->products[0]->update(['price' => '200.00']);

        $this->getJson(self::ENDPOINT)->assertJsonPath('data.0.regular_price', '200.00');
    }
}
