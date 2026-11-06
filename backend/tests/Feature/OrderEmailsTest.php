<?php

namespace Tests\Feature;

use App\Mail\CustomerOrderPlacedMail;
use App\Mail\CustomerPaymentReminderMail;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderEmailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_confirmation_email_asks_the_customer_to_confirm_on_whatsapp(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $mail = new CustomerOrderPlacedMail($order);

        $mail->assertHasSubject('We received your order');
        $mail->assertSeeInHtml("/api/v1/orders/{$order->order_number}/whatsapp?", false);
        $mail->assertDontSeeInHtml('is being prepared');
        $mail->assertDontSeeInHtml("{$order->order_number} confirmed");
    }

    public function test_the_reminder_email_does_not_ask_for_a_payment(): void
    {
        $mail = new CustomerPaymentReminderMail(Order::factory()->create());

        $mail->assertHasSubject('Complete your order');
        $mail->assertDontSeeInHtml('arrange payment');
    }
}
