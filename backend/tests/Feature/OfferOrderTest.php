<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Override;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\BuildsOffers;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

// a set is sold as one product, but ordering it takes one bottle of each perfume inside it
class OfferOrderTest extends TestCase
{
    use BuildsOffers, BuildsOrderPayload, RefreshDatabase;

    private const ENDPOINT = '/api/v1/orders';

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        // fake email sending
        Queue::fake();
    }

    public function test_ordering_a_set_takes_one_of_each_perfume_inside(): void
    {
        [, $set, $inside] = $this->makeOffer([5, 5]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 2],
        ]))->assertCreated();

        $this->assertSame(8, $set->fresh()->stock);
        $this->assertSame(3, $inside[0]->fresh()->stock);
        $this->assertSame(3, $inside[1]->fresh()->stock);
    }

    public function test_ordering_a_set_takes_the_free_perfume_too(): void
    {
        $free = Product::factory()->create(['stock' => 5]);
        [, $set] = $this->makeOffer([5], free: $free);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 2],
        ]))->assertCreated();

        $this->assertSame(3, $free->fresh()->stock);
    }

    public function test_a_set_is_refused_when_a_perfume_inside_is_sold_out(): void
    {
        [, $set, $inside] = $this->makeOffer([5, 0]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 1],
        ]))->assertBadRequest()
            ->assertJsonPath('message', "Stock insuffisant pour {$inside[1]->name}. Quantité demandée : 1, quantité disponible : 0.");

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $set->fresh()->stock);
        $this->assertSame(5, $inside[0]->fresh()->stock);
        $this->assertSame(0, $inside[1]->fresh()->stock);
    }

    public function test_a_set_is_refused_when_the_set_itself_is_sold_out(): void
    {
        [, $set, $inside] = $this->makeOffer([5], set: ['stock' => 1]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 2],
        ]))->assertBadRequest();

        $this->assertSame(1, $set->fresh()->stock);
        $this->assertSame(5, $inside[0]->fresh()->stock);
    }

    // takeStock() works on the one locked copy of each product, so both lines see the same stock
    public function test_a_perfume_ordered_alone_and_inside_a_set_is_counted_twice(): void
    {
        [, $set, $inside] = $this->makeOffer([3]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $inside[0]->id, 'quantity' => 2],
            ['product_id' => $set->id, 'quantity' => 2],
        ]))->assertBadRequest();

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(3, $inside[0]->fresh()->stock);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $inside[0]->id, 'quantity' => 1],
            ['product_id' => $set->id, 'quantity' => 2],
        ]))->assertCreated();

        $this->assertSame(0, $inside[0]->fresh()->stock);
    }

    public function test_a_perfume_inside_two_sets_is_counted_for_both(): void
    {
        [, $firstSet, $inside] = $this->makeOffer([1]);
        [$second, $secondSet] = $this->makeOffer([]);
        $second->products()->sync([$inside[0]->id => ['is_free' => false]]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $firstSet->id, 'quantity' => 1],
            ['product_id' => $secondSet->id, 'quantity' => 1],
        ]))->assertBadRequest();

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $inside[0]->fresh()->stock);
    }

    // dates are written as offsets: data providers run before the app (and now()) exists
    public static function offersNotRunning(): array
    {
        return [
            'ended' => [['ends_at' => '-1 minute']],
            'not started yet' => [['starts_at' => '+1 minute']],
            'switched off' => [['is_active' => false]],
        ];
    }

    #[DataProvider('offersNotRunning')]
    public function test_a_set_cant_be_ordered_when_its_offer_is_not_running(array $offer): void
    {
        $offer = array_map(fn ($value) => is_string($value) ? now()->modify($value) : $value, $offer);
        [, $set, $inside] = $this->makeOffer([5], $offer);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 1],
        ]))->assertUnprocessable()
            ->assertJsonPath('errors.items.0', "L’offre {$set->name} n’est plus disponible.");

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $set->fresh()->stock);
        $this->assertSame(5, $inside[0]->fresh()->stock);
    }

    public function test_a_set_without_an_offer_cant_be_ordered(): void
    {
        $set = Product::factory()->create(['is_offer' => true, 'stock' => 10]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 1],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items');

        $this->assertSame(10, $set->fresh()->stock);
    }

    public function test_a_hidden_set_cant_be_ordered(): void
    {
        [, $set] = $this->makeOffer([5], set: ['is_active' => false]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 1],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');
    }

    // the set has its own fixed price: the perfumes inside it never change the total
    public function test_the_set_price_is_charged_not_the_perfumes_inside(): void
    {
        [, $set] = $this->makeOffer([5, 5], set: ['price' => 180]);

        $payload = $this->orderPayload([['product_id' => $set->id, 'quantity' => 2]]);
        $this->postJson(self::ENDPOINT, $payload)->assertCreated()->assertJsonPath('data.total', '360.00');

        $order = Order::where('idempotency_key', $payload['idempotency_key'])->firstOrFail();
        $this->assertSame('360.00', $order->total);
        $this->assertCount(1, $order->items);
        $this->assertSame('180.00', $order->items[0]->unit_price);
    }

    // the WhatsApp message and the emails read product_name, so the set keeps its contents in it
    public function test_the_order_item_names_the_perfumes_inside_the_set(): void
    {
        [, $set] = $this->makeOffer([5], set: ['name' => 'Collection Gissah', 'description' => 'Oud Royal + Rose Musk']);
        $perfume = Product::factory()->create(['name' => 'Velvet Oud', 'description' => 'A woody perfume']);

        $payload = $this->orderPayload([
            ['product_id' => $set->id, 'quantity' => 1],
            ['product_id' => $perfume->id, 'quantity' => 1],
        ]);
        $this->postJson(self::ENDPOINT, $payload)->assertCreated();

        $names = OrderItem::orderBy('id')->pluck('product_name')->all();
        $this->assertSame(['Collection Gissah (Oud Royal + Rose Musk)', 'Velvet Oud'], $names);
    }

    public function test_cancelling_an_order_gives_back_the_perfumes_inside(): void
    {
        $free = Product::factory()->create(['stock' => 5]);
        [, $set, $inside] = $this->makeOffer([5, 5], free: $free);

        $orderNumber = $this->placeOrder($set->id, 2);
        $this->assertSame(3, $inside[0]->fresh()->stock);

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->patchJson("/api/v1/admin/orders/{$orderNumber}/status", ['status' => 'cancelled'])->assertOk();

        $this->assertSame(10, $set->fresh()->stock);
        $this->assertSame(5, $inside[0]->fresh()->stock);
        $this->assertSame(5, $inside[1]->fresh()->stock);
        $this->assertSame(5, $free->fresh()->stock);
    }

    public function test_auto_cancelling_gives_back_the_perfumes_inside(): void
    {
        [, $set, $inside] = $this->makeOffer([3]);
        Order::factory()
            ->has(OrderItem::factory()->for($set)->state(['quantity' => 2]), 'items')
            ->create(['created_at' => now()->subHours(2)]);

        $this->artisan('orders:cancel-unpaid', ['--hours' => 1])->assertSuccessful();

        $this->assertSame(12, $set->fresh()->stock);
        $this->assertSame(5, $inside[0]->fresh()->stock);
    }

    private function placeOrder(int $productId, int $quantity): string
    {
        $payload = $this->orderPayload([['product_id' => $productId, 'quantity' => $quantity]]);

        $this->postJson(self::ENDPOINT, $payload)->assertCreated();

        return Order::where('idempotency_key', $payload['idempotency_key'])->value('order_number');
    }
}
