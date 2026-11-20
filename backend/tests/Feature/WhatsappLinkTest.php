<?php

namespace Tests\Feature;

use App\Mail\CustomerPaymentReminderMail;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsappLinkTest extends TestCase
{
    use RefreshDatabase;

    private function pendingOrder(array $attributes = []): Order
    {
        return Order::factory()->create([
            'status' => 'pending',
            'whatsapp_opened_at' => null,
            ...$attributes,
        ]);
    }

    public function test_the_reminder_email_uses_the_link_that_records_the_click(): void
    {
        $order = $this->pendingOrder();

        $html = (new CustomerPaymentReminderMail($order))->render();

        $this->assertStringContainsString("/api/v1/orders/{$order->idempotency_key}/whatsapp?", $html);
        $this->assertStringNotContainsString('https://wa.me/', $html);
    }

    public function test_following_the_email_link_redirects_to_whatsapp_and_saves_the_order(): void
    {
        $order = $this->pendingOrder();

        $this->get($order->whatsappRedirectUrl())->assertRedirectContains('https://wa.me/');
        $this->assertNotNull($order->fresh()->whatsapp_opened_at);

        $this->travel(61)->minutes();
        $this->artisan('orders:cancel-unpaid', ['--hours' => 1, '--unopened' => true]);

        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_the_email_link_needs_a_valid_signature(): void
    {
        $order = $this->pendingOrder();

        $this->getJson("/api/v1/orders/{$order->idempotency_key}/whatsapp")->assertForbidden();
        $this->assertNull($order->fresh()->whatsapp_opened_at);
    }

    public function test_the_email_link_of_a_cancelled_order_goes_back_to_the_shop(): void
    {
        $order = $this->pendingOrder(['status' => 'cancelled']);

        $this->get($order->whatsappRedirectUrl())->assertRedirect(config('app.frontend_url'));
        $this->assertNull($order->fresh()->whatsapp_opened_at);
    }

    public function test_the_opened_url_is_still_valid_when_the_reminder_goes_out(): void
    {
        $order = $this->pendingOrder();
        $url = $order->whatsappOpenedUrl();

        $this->travel(31)->minutes();

        $this->patchJson($url)->assertNoContent();
        $this->assertNotNull($order->fresh()->whatsapp_opened_at);
    }

    public function test_the_opened_url_does_nothing_for_a_cancelled_order(): void
    {
        $order = $this->pendingOrder(['status' => 'cancelled']);

        $this->patchJson($order->whatsappOpenedUrl())->assertNoContent();

        $this->assertNull($order->fresh()->whatsapp_opened_at);
    }
}
