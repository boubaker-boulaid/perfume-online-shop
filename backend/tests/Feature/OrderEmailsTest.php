<?php

namespace Tests\Feature;

use App\Mail\CustomerOrderCancelledMail;
use App\Mail\CustomerOrderPlacedMail;
use App\Mail\CustomerPaymentReminderMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use RuntimeException;
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

    public function test_the_customer_is_told_when_the_scheduler_cancels_the_order(): void
    {
        Mail::fake();
        $order = Order::factory()->create(['status' => 'pending', 'whatsapp_opened_at' => null, 'created_at' => now()->subHours(2)]);

        $this->artisan('orders:cancel-unpaid', ['--hours' => 1, '--unopened' => true]);

        $this->assertSame('cancelled', $order->fresh()->status);
        Mail::assertQueued(CustomerOrderCancelledMail::class, fn ($mail) => $mail->hasTo($order->email) && $mail->order->is($order));
    }

    public function test_the_customer_is_told_when_an_admin_cancels_the_order(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->admin()->create());
        $order = Order::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/v1/admin/orders/{$order->order_number}/status", ['status' => 'cancelled'])->assertOk();

        Mail::assertQueued(CustomerOrderCancelledMail::class);
    }

    public function test_other_status_changes_send_no_cancellation_email(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->admin()->create());
        $order = Order::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/v1/admin/orders/{$order->order_number}/status", ['status' => 'confirmed'])->assertOk();

        Mail::assertNotQueued(CustomerOrderCancelledMail::class);
    }

    public function test_a_mail_failure_does_not_undo_the_cancellation(): void
    {
        Mail::shouldReceive('to')->andThrow(new RuntimeException('mail server down'));
        Sanctum::actingAs(User::factory()->admin()->create());
        $order = Order::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/v1/admin/orders/{$order->order_number}/status", ['status' => 'cancelled'])->assertOk();

        $this->assertSame('cancelled', $order->fresh()->status);
    }

    public function test_the_cancellation_email_renders(): void
    {
        $mail = new CustomerOrderCancelledMail(Order::factory()->create());

        $mail->assertHasSubject('Your order was cancelled');
        $mail->assertSeeInHtml(config('app.frontend_url'));
        $mail->assertDontSeeInHtml('wa.me');
    }
}
