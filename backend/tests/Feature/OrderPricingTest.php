<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OrderPricingTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/v1/orders';

    protected function setUp(): void
    {
        parent::setUp();

        // emails are not what we are testing here
        Queue::fake();
    }

    public function test_total_is_calculated_from_database_prices(): void
    {
        $oud = $this->product(price: '19.99');
        $musk = $this->product(price: '250.00');

        $response = $this->postJson(self::ENDPOINT, $this->payload([
            ['product_id' => $oud->id, 'quantity' => 3],
            ['product_id' => $musk->id, 'quantity' => 1],
        ]));

        // 19.99 x 3 + 250.00 x 1 = 309.97
        $response->assertCreated()->assertJsonPath('data.total', '309.97');

        $order = Order::with('items')->sole();
        $this->assertSame('309.97', $order->subtotal);
        $this->assertSame('309.97', $order->total);

        $line = $order->items->firstWhere('product_id', $oud->id);
        $this->assertSame('19.99', $line->unit_price);
        $this->assertSame('59.97', $line->line_total);
    }

    public function test_money_fields_sent_by_the_client_are_ignored(): void
    {
        $product = $this->product(price: '500.00');

        $response = $this->postJson(self::ENDPOINT, $this->payload(
            [['product_id' => $product->id, 'quantity' => 1]],
            [
                'total' => 1,
                'subtotal' => 1,
                'shipping_cost' => -499,
                'payment_status' => 'paid',
                'status' => 'delivered',
            ],
        ));

        // the attack "works" as a request, it just changes nothing
        $response->assertCreated()->assertJsonPath('data.total', '500.00');

        $order = Order::sole();
        $this->assertSame('500.00', $order->subtotal);
        $this->assertSame('500.00', $order->total);
        $this->assertSame('0.00', $order->fresh()->shipping_cost);
        $this->assertSame('unpaid', $order->fresh()->payment_status);
        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_item_with_a_client_price_is_rejected(): void
    {
        $product = $this->product(price: '500.00', stock: 10);

        $response = $this->postJson(self::ENDPOINT, $this->payload([
            ['product_id' => $product->id, 'quantity' => 1, 'price' => 1],
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors('items.0');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $product->fresh()->stock);
    }

    #[DataProvider('invalidQuantities')]
    public function test_quantity_cannot_be_used_to_change_the_total(mixed $quantity): void
    {
        $product = $this->product(price: '500.00', stock: 10);

        $response = $this->postJson(self::ENDPOINT, $this->payload([
            ['product_id' => $product->id, 'quantity' => $quantity],
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors('items.0.quantity');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(10, $product->fresh()->stock);
    }

    public static function invalidQuantities(): array
    {
        return [
            'zero makes the order free' => [0],
            'negative makes the total negative' => [-1],
            'fraction pays part of the price' => [0.01],
        ];
    }

    public function test_the_current_price_is_charged_and_old_orders_keep_theirs(): void
    {
        $product = $this->product(price: '100.00');

        $this->postJson(self::ENDPOINT, $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertCreated();

        $product->update(['price' => '150.00']);

        $this->postJson(self::ENDPOINT, $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertCreated()->assertJsonPath('data.total', '150.00');

        $this->assertSame(['100.00', '150.00'], Order::orderBy('id')->pluck('total')->all());
    }

    private function product(string $price, int $stock = 50): Product
    {
        return Product::factory()->create(['price' => $price, 'stock' => $stock]);
    }

    private function payload(array $items, array $extra = []): array
    {
        return [
            'customer_name' => 'Test Customer',
            'phone' => '+212600000000',
            'email' => 'customer@example.com',
            'city' => 'Agadir',
            'address' => '1 Test Street',
            'idempotency_key' => (string) Str::uuid(),
            'items' => $items,
            ...$extra,
        ];
    }
}
