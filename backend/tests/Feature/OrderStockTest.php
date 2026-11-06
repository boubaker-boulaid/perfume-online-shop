<?php

namespace Tests\Feature;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Override;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class OrderStockTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    private const ENDPOINT = '/api/v1/orders';

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        // fake email sending
        Queue::fake();
        Exceptions::fake();
    }

    public function test_insufficient_stock_is_rejected_with_exception()
    {
        $product1 = Product::factory()->create([
            'stock' => 10,
        ]);
        $product2 = Product::factory()->create([
            'stock' => 40,
        ]);

        $response = $this->postJson(self::ENDPOINT, $this->orderPayload([
            [
                'product_id' => $product1->id,
                'quantity' => 20,
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 20,
            ],
        ]));

        $response->assertBadRequest();

        Exceptions::assertReported(InsufficientStockException::class);

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $product1->fresh()->stock);
        $this->assertSame(40, $product2->fresh()->stock);
    }

    public function test_ordering_exactly_available_stock()
    {
        $product = Product::factory()->create([
            'price' => 20,
            'stock' => 10,
        ]);

        $response = $this->postJson(self::ENDPOINT, $this->orderPayload([
            [
                'product_id' => $product->id,
                'quantity' => 10,
            ],
        ]));

        $response->assertCreated();

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['total' => 200]);
        $this->assertSame(0, $product->fresh()->stock);
    }

    public function test_ordering_same_product_twice()
    {
        $product = Product::factory()->create([
            'stock' => 50,
        ]);

        $response = $this->postJson(self::ENDPOINT, $this->orderPayload([
            [
                'product_id' => $product->id,
                'quantity' => 2,
            ],
            [
                'product_id' => $product->id,
                'quantity' => 3,
            ],
        ]));

        // a product can only appear once in an order, even when there is enough stock for both lines
        $response->assertUnprocessable()->assertJsonValidationErrors('items.1.product_id');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(50, $product->fresh()->stock);
    }

    // the first item is decremented before the second one fails, only the transaction gives it back
    public function test_a_failing_item_rolls_back_the_items_before_it(): void
    {
        $enough = Product::factory()->create(['stock' => 40]);
        $tooLittle = Product::factory()->create(['stock' => 10]);

        $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $enough->id, 'quantity' => 20],
            ['product_id' => $tooLittle->id, 'quantity' => 20],
        ]))->assertBadRequest();

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(40, $enough->fresh()->stock);
        $this->assertSame(10, $tooLittle->fresh()->stock);
    }

    // stock is taken when the order is placed, the status changes after that must not touch it again
    public function test_stock_is_reduced_exactly_once_over_the_life_of_an_order(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $orderNumber = $this->placeOrder($product, 3);
        $this->assertSame(7, $product->fresh()->stock);

        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['confirmed', 'shipped', 'delivered'] as $status) {
            $this->patchJson("/api/v1/admin/orders/{$orderNumber}/status", ['status' => $status])->assertOk();
            $this->assertSame(7, $product->fresh()->stock);
        }
    }

    public function test_cancelling_gives_the_stock_back_exactly_once(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $orderNumber = $this->placeOrder($product, 3);

        Sanctum::actingAs(User::factory()->admin()->create());
        $url = "/api/v1/admin/orders/{$orderNumber}/status";

        $this->patchJson($url, ['status' => 'cancelled'])->assertOk();
        $this->assertSame(10, $product->fresh()->stock);

        $this->patchJson($url, ['status' => 'cancelled'])->assertUnprocessable();
        $this->assertSame(10, $product->fresh()->stock);
    }

    // the scheduler runs this command every 5 minutes, so it runs again over orders it already cancelled
    public function test_auto_cancelling_gives_the_stock_back_exactly_once(): void
    {
        $product = Product::factory()->create(['stock' => 7]);
        $order = Order::factory()
            ->has(OrderItem::factory()->for($product)->state(['quantity' => 3]), 'items')
            ->create(['created_at' => now()->subHours(2)]);

        $this->artisan('orders:cancel-unpaid', ['--hours' => 1])->assertSuccessful();
        $this->artisan('orders:cancel-unpaid', ['--hours' => 1])->assertSuccessful();

        $this->assertSame('cancelled', $order->fresh()->status);
        $this->assertSame(10, $product->fresh()->stock);
        $this->assertDatabaseCount('order_status_history', 1);
    }

    public function test_auto_cancelling_leaves_confirmed_orders_and_their_stock_alone(): void
    {
        $product = Product::factory()->create(['stock' => 7]);
        $order = Order::factory()->confirmed()
            ->has(OrderItem::factory()->for($product)->state(['quantity' => 3]), 'items')
            ->create(['created_at' => now()->subHours(48)]);

        $this->artisan('orders:cancel-unpaid', ['--hours' => 1])->assertSuccessful();

        $this->assertSame('confirmed', $order->fresh()->status);
        $this->assertSame(7, $product->fresh()->stock);
    }

    private function placeOrder(Product $product, int $quantity): string
    {
        return $this->postJson(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $product->id, 'quantity' => $quantity],
        ]))->assertCreated()->json('data.order_number');
    }

    public function test_the_stock_error_does_not_depend_on_the_accept_header(): void
    {
        $product = Product::factory()->create(['stock' => 1]);

        $this->post(self::ENDPOINT, $this->orderPayload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]), ['Accept' => '*/*'])
            ->assertBadRequest()
            ->assertJsonPath('success', false);
    }
}
