<?php

namespace Tests\Feature;

use App\Mail\AdminOrderPlacedMail;
use App\Mail\CustomerOrderCancelledMail;
use App\Mail\CustomerOrderPlacedMail;
use App\Mail\CustomerPaymentReminderMail;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

// The order number is only for the admins: nothing a customer receives may contain it.
class OrderNumberIsPrivateTest extends TestCase
{
    use RefreshDatabase;

    public function test_placing_an_order_never_returns_the_number(): void
    {
        $product = Product::factory()->create(['stock' => 5]);
        $key = (string) Str::uuid();
        $payload = [
            'customer_name' => 'Sara',
            'phone' => '0612345678',
            'email' => 'sara@example.com',
            'city' => 'Agadir',
            'address' => '12 Avenue Hassan II',
            'idempotency_key' => $key,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ];

        $created = $this->postJson('/api/v1/orders', $payload)->assertCreated();
        $retried = $this->postJson('/api/v1/orders', $payload)->assertOk();

        $number = Order::where('idempotency_key', $key)->value('order_number');

        $this->assertStringNotContainsString($number, $created->getContent());
        $this->assertStringNotContainsString($number, $retried->getContent());
        $this->assertStringNotContainsString(rawurlencode($number), $created->getContent());
    }

    public function test_the_whatsapp_message_and_links_never_contain_the_number(): void
    {
        $order = Order::factory()->create();

        $this->assertStringNotContainsString($order->order_number, $order->whatsappMessage());
        $this->assertStringNotContainsString($order->order_number, $order->whatsappLink());
        $this->assertStringNotContainsString($order->order_number, $order->whatsappOpenedUrl());
        $this->assertStringNotContainsString($order->order_number, $order->whatsappRedirectUrl());
    }

    public function test_the_customer_emails_never_contain_the_number(): void
    {
        $order = Order::factory()->create();

        foreach ([CustomerOrderPlacedMail::class, CustomerOrderCancelledMail::class, CustomerPaymentReminderMail::class] as $mail) {
            $html = (new $mail($order))->render();

            $this->assertStringNotContainsString($order->order_number, $html, $mail);
            $this->assertStringNotContainsString('Numéro de commande', $html, $mail);
        }
    }

    public function test_the_admins_still_get_the_number(): void
    {
        $order = Order::factory()->create();

        $this->assertStringContainsString($order->order_number, (new AdminOrderPlacedMail($order))->render());
    }
}
