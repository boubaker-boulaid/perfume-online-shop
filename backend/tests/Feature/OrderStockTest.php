<?php

namespace Tests\Feature;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Queue;
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
            'stock' => 10
        ]);
        $product2 = Product::factory()->create([
            'stock' => 40,
        ]);

        $response = $this->postJson(self::ENDPOINT, $this->orderPayload([
            [
                'product_id' => $product1->id,
                'quantity' => 20
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 20
            ]
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
                'quantity' => 10
            ]
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
                'quantity' => 2
            ],
            [
                'product_id' => $product->id,
                'quantity' => 3
            ]
        ]));

        // a product can only appear once in an order, even when there is enough stock for both lines
        $response->assertUnprocessable()->assertJsonValidationErrors('items.1.product_id');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(50, $product->fresh()->stock);
    }
}
