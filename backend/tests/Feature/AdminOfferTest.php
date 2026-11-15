<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Override;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\Concerns\BuildsOffers;
use Tests\TestCase;

class AdminOfferTest extends TestCase
{
    use BuildsOffers, RefreshDatabase;

    private const ENDPOINT = '/api/v1/admin/offers';

    private const JSON = ['Accept' => 'application/json'];

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());
    }

    // the admin must see everything, including the offers customers can't see any more
    public function test_the_admin_list_shows_every_offer_paginated(): void
    {
        $this->makeOffer();
        $this->makeOffer(offer: ['ends_at' => now()->subDay()]);
        $this->makeOffer(offer: ['is_active' => false]);

        $this->getJson(self::ENDPOINT)
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_one_offer_is_shown_even_when_it_is_not_current(): void
    {
        [$offer] = $this->makeOffer(offer: ['is_active' => false]);

        $this->getJson(self::ENDPOINT."/{$offer->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $offer->id)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_creating_an_offer(): void
    {
        $set = Product::factory()->create(['is_offer' => true, 'price' => 180]);
        $perfumes = Product::factory()->count(2)->create();
        $free = Product::factory()->create();

        $response = $this->post(self::ENDPOINT, $this->offerFields($set, $perfumes->pluck('id')->all(), [
            'free_product_id' => $free->id,
            'terms' => ['Dans la limite des stocks'],
        ]), self::JSON);

        $response->assertCreated()
            ->assertJsonPath('data.slug', $set->slug)
            ->assertJsonPath('data.set.id', $set->id)
            ->assertJsonCount(2, 'data.products')
            ->assertJsonPath('data.free_product.id', $free->id)
            ->assertJsonPath('data.terms', ['Dans la limite des stocks'])
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.sort_order', 0);

        $offer = Offer::sole();
        $this->assertSame($set->slug, $offer->slug);
        Storage::disk('public')->assertExists($offer->image_path);
        $this->assertSame(
            [$perfumes[0]->id => 0, $perfumes[1]->id => 0, $free->id => 1],
            $offer->products()->orderBy('products.id')->get()->mapWithKeys(fn ($p) => [$p->id => (int) $p->pivot->is_free])->all(),
        );
    }

    public function test_a_new_offer_shows_up_for_customers_straight_away(): void
    {
        $this->getJson('/api/v1/offers')->assertJsonCount(0, 'data'); // caches the empty list

        $set = Product::factory()->create(['is_offer' => true]);
        $this->post(self::ENDPOINT, $this->offerFields($set, [Product::factory()->create()->id]), self::JSON)->assertCreated();

        $this->getJson('/api/v1/offers')->assertJsonCount(1, 'data');
    }

    public static function invalidOffers(): array
    {
        return [
            'the set is a normal perfume' => [fn ($t) => ['product_id' => Product::factory()->create()->id], 'product_id'],
            'the set already has an offer' => [fn ($t) => ['product_id' => $t->makeOffer()[1]->id], 'product_id'],
            'a set inside the set' => [fn ($t) => ['product_ids' => [Product::factory()->create(['is_offer' => true])->id]], 'product_ids.0'],
            'no perfumes inside' => [fn ($t) => ['product_ids' => []], 'product_ids'],
            'the same perfume twice' => [fn ($t) => ['product_ids' => [$id = Product::factory()->create()->id, $id]], 'product_ids.0'],
            'the free perfume is also a paid one' => [fn ($t) => ['free_product_id' => $id = Product::factory()->create()->id, 'product_ids' => [$id]], 'free_product_id'],
            'it ends before it starts' => [fn ($t) => ['starts_at' => '2026-12-10 00:00:00', 'ends_at' => '2026-12-01 00:00:00'], 'ends_at'],
            'no image' => [fn ($t) => ['image' => null], 'image'],
            'not an image' => [fn ($t) => ['image' => UploadedFile::fake()->create('offer.pdf', 10, 'application/pdf')], 'image'],
        ];
    }

    #[DataProvider('invalidOffers')]
    public function test_invalid_offers_are_refused(callable $change, string $field): void
    {
        $set = Product::factory()->create(['is_offer' => true]);
        $fields = [...$this->offerFields($set, [Product::factory()->create()->id]), ...$change($this)];
        $offersBefore = Offer::count();

        $this->post(self::ENDPOINT, array_filter($fields, fn ($v) => $v !== null), self::JSON)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);

        $this->assertSame($offersBefore, Offer::count());
        $this->assertSame([], Storage::disk('public')->allFiles('offers'));
    }

    public function test_a_failed_create_leaves_no_image_behind(): void
    {
        Offer::creating(fn () => throw new RuntimeException('database down'));
        $set = Product::factory()->create(['is_offer' => true]);

        $this->post(self::ENDPOINT, $this->offerFields($set, [Product::factory()->create()->id]), self::JSON)
            ->assertServerError();

        $this->assertDatabaseCount('offers', 0);
        $this->assertSame([], Storage::disk('public')->allFiles('offers'));
    }

    public function test_updating_an_offer(): void
    {
        [$offer, $set] = $this->makeOffer();
        $otherSet = Product::factory()->create(['is_offer' => true]);

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", [
            'title' => 'Collection Ramadan',
            'is_active' => false,
            'sort_order' => 3,
            'product_id' => $otherSet->id, // not editable: the set of an offer never changes
        ])->assertOk()
            ->assertJsonPath('data.title', 'Collection Ramadan')
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.sort_order', 3);

        $offer->refresh();
        $this->assertSame('Collection Ramadan', $offer->title);
        $this->assertSame($set->id, $offer->product_id);
    }

    public function test_updating_the_perfumes_replaces_them(): void
    {
        [$offer] = $this->makeOffer([5, 5]);
        $new = Product::factory()->create();
        $free = Product::factory()->create();

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", [
            'product_ids' => [$new->id],
            'free_product_id' => $free->id,
        ])->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.id', $new->id)
            ->assertJsonPath('data.free_product.id', $free->id);

        $this->assertEqualsCanonicalizing([$new->id, $free->id], $offer->products()->pluck('products.id')->all());
    }

    public function test_updating_other_fields_keeps_the_perfumes(): void
    {
        [$offer, , $inside] = $this->makeOffer([5, 5]);

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", ['title' => 'Collection Ramadan'])->assertOk();

        $this->assertEqualsCanonicalizing($inside->pluck('id')->all(), $offer->products()->pluck('products.id')->all());
    }

    // the admin form always sends both dates, so they are checked together
    public function test_an_update_that_ends_before_it_starts_is_refused(): void
    {
        [$offer] = $this->makeOffer();

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", [
            'starts_at' => '2026-12-10 00:00:00',
            'ends_at' => '2026-12-01 00:00:00',
        ])->assertUnprocessable()->assertJsonValidationErrors('ends_at');
    }

    public function test_replacing_the_image_removes_the_old_one(): void
    {
        [$offer] = $this->makeOffer();
        Storage::disk('public')->put($offer->image_path, 'old image');

        $this->post(self::ENDPOINT."/{$offer->slug}", [
            '_method' => 'PATCH',
            'image' => UploadedFile::fake()->image('new.jpg'),
        ], self::JSON)->assertOk();

        $newPath = $offer->fresh()->image_path;
        $this->assertNotSame('offers/test.webp', $newPath);
        Storage::disk('public')->assertExists($newPath);
        Storage::disk('public')->assertMissing('offers/test.webp');
    }

    public function test_an_update_without_an_image_keeps_the_old_one(): void
    {
        [$offer] = $this->makeOffer();
        Storage::disk('public')->put($offer->image_path, 'old image');

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", ['title' => 'Collection Ramadan'])->assertOk();

        $this->assertSame('offers/test.webp', $offer->fresh()->image_path);
        Storage::disk('public')->assertExists('offers/test.webp');
    }

    public function test_a_changed_offer_shows_up_for_customers_straight_away(): void
    {
        [$offer] = $this->makeOffer();
        $this->getJson('/api/v1/offers')->assertJsonCount(1, 'data');

        $this->patchJson(self::ENDPOINT."/{$offer->slug}", ['is_active' => false])->assertOk();

        $this->getJson('/api/v1/offers')->assertJsonCount(0, 'data');
    }

    // the set and the perfumes stay: only the offer and its offer_product rows go
    public function test_deleting_an_offer(): void
    {
        [$offer, $set, $inside] = $this->makeOffer();
        Storage::disk('public')->put($offer->image_path, 'image');
        $this->getJson('/api/v1/offers')->assertJsonCount(1, 'data');

        $this->deleteJson(self::ENDPOINT."/{$offer->slug}")->assertNoContent();

        $this->assertModelMissing($offer);
        $this->assertDatabaseCount('offer_product', 0);
        Storage::disk('public')->assertMissing('offers/test.webp');
        $this->assertModelExists($set);
        $this->assertModelExists($inside[0]);
        $this->getJson('/api/v1/offers')->assertJsonCount(0, 'data');
    }

    public function test_a_product_used_in_an_offer_cant_be_deleted(): void
    {
        $free = Product::factory()->create();
        [, $set, $inside] = $this->makeOffer([5], free: $free);
        $message = 'Impossible de supprimer un produit utilisé dans une offre. Masquez-le ou retirez-le de l’offre.';

        foreach ([$set, $inside[0], $free] as $product) {
            $this->deleteJson("/api/v1/admin/products/{$product->slug}")
                ->assertConflict()
                ->assertJsonPath('message', $message);
            $this->assertModelExists($product);
        }

        $unused = Product::factory()->create();
        $this->deleteJson("/api/v1/admin/products/{$unused->slug}")->assertNoContent();
    }

    public function test_the_admin_can_mark_a_product_as_a_set(): void
    {
        $this->post('/api/v1/admin/products', [
            'category_id' => Product::factory()->create()->category_id,
            'name' => 'Collection Gissah',
            'price' => '180.00',
            'stock' => 10,
            'is_offer' => true,
            'image' => UploadedFile::fake()->image('set.jpg'),
        ], self::JSON)->assertCreated()->assertJsonPath('data.is_offer', true);

        $product = Product::factory()->create();
        $this->patchJson("/api/v1/admin/products/{$product->slug}", ['is_offer' => true])
            ->assertOk()
            ->assertJsonPath('data.is_offer', true);
    }

    private function offerFields(Product $set, array $productIds, array $extra = []): array
    {
        return [
            'product_id' => $set->id,
            'title' => 'Collection Gissah',
            'tagline' => '4 parfums pour 180 DH',
            'image' => UploadedFile::fake()->image('offer.jpg'),
            'starts_at' => now()->subDay()->toDateTimeString(),
            'ends_at' => now()->addWeek()->toDateTimeString(),
            'product_ids' => $productIds,
            ...$extra,
        ];
    }
}
