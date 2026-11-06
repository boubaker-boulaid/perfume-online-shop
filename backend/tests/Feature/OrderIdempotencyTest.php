<?php

namespace Tests\Feature;

use App\Jobs\SendOrderConfirmation;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class OrderIdempotencyTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    private const ENDPOINT = '/api/v1/orders';

    protected function setUp(): void
    {
        parent::setUp();

        // emails are not what we are testing here
        Queue::fake();
    }

    public function test_the_same_key_returns_the_same_order(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $payload = $this->orderPayload([['product_id' => $product->id, 'quantity' => 3]]);

        $first = $this->postJson(self::ENDPOINT, $payload)->assertCreated();
        $retry = $this->postJson(self::ENDPOINT, $payload)->assertOk();

        $this->assertSame($first->json('data.order_number'), $retry->json('data.order_number'));
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertSame(7, $product->fresh()->stock);
    }

    public function test_a_retry_with_different_items_keeps_the_original_order(): void
    {
        $product = Product::factory()->create(['price' => '100.00', 'stock' => 10]);
        $other = Product::factory()->create(['price' => '999.00', 'stock' => 10]);
        $key = fake()->uuid();

        $this->postJson(self::ENDPOINT, $this->orderPayload(
            [['product_id' => $product->id, 'quantity' => 1]],
            ['idempotency_key' => $key],
        ))->assertCreated();

        $this->postJson(self::ENDPOINT, $this->orderPayload(
            [['product_id' => $other->id, 'quantity' => 5]],
            ['idempotency_key' => $key],
        ))->assertOk()->assertJsonPath('data.total', '100.00');

        $this->assertDatabaseCount('orders', 1);
        $this->assertSame(10, $other->fresh()->stock);
    }

    // the customer's connection dropped and they retry, but they just bought the last unit
    public function test_a_retry_still_works_after_the_product_sold_out(): void
    {
        $product = Product::factory()->create(['stock' => 1]);
        $payload = $this->orderPayload([['product_id' => $product->id, 'quantity' => 1]]);

        $first = $this->postJson(self::ENDPOINT, $payload)->assertCreated();
        $retry = $this->postJson(self::ENDPOINT, $payload)->assertOk();

        $this->assertSame($first->json('data.order_number'), $retry->json('data.order_number'));
        $this->assertSame(0, $product->fresh()->stock);
    }

    public function test_different_keys_create_different_orders(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $items = [['product_id' => $product->id, 'quantity' => 2]];

        $first = $this->postJson(self::ENDPOINT, $this->orderPayload($items))->assertCreated();
        $second = $this->postJson(self::ENDPOINT, $this->orderPayload($items))->assertCreated();

        $this->assertNotSame($first->json('data.order_number'), $second->json('data.order_number'));
        $this->assertDatabaseCount('orders', 2);
        $this->assertSame(6, $product->fresh()->stock);
    }

    public function test_a_retry_does_not_send_the_confirmation_again_once_it_was_sent(): void
    {
        $product = Product::factory()->create();
        $payload = $this->orderPayload([['product_id' => $product->id, 'quantity' => 1]]);

        $this->postJson(self::ENDPOINT, $payload)->assertCreated();
        Queue::assertPushed(SendOrderConfirmation::class, 1);

        Order::sole()->update(['confirmation_sent_at' => now()]);

        $this->postJson(self::ENDPOINT, $payload)->assertOk();
        Queue::assertPushed(SendOrderConfirmation::class, 1);
    }

    public function test_a_retry_sends_the_confirmation_again_if_it_was_never_sent(): void
    {
        $product = Product::factory()->create();
        $payload = $this->orderPayload([['product_id' => $product->id, 'quantity' => 1]]);

        $this->postJson(self::ENDPOINT, $payload)->assertCreated();
        $this->postJson(self::ENDPOINT, $payload)->assertOk();

        Queue::assertPushed(SendOrderConfirmation::class, 2);
    }

    public function test_the_key_must_be_a_uuid(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $this->postJson(self::ENDPOINT, $this->orderPayload(
            [['product_id' => $product->id, 'quantity' => 1]],
            ['idempotency_key' => 'not-a-uuid'],
        ))->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_an_order_number_collision_is_an_error_and_not_a_missing_order(): void
    {
        $product = Product::factory()->create(['stock' => 5]);
        Order::factory()->create(['order_number' => sprintf('ORD-%d-%06d', now()->year, 1)]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertServerError();

        $this->assertSame(5, $product->fresh()->stock);
    }
}
