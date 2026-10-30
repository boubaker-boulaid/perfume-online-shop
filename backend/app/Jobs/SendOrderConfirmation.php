<?php

namespace App\Jobs;

use App\Mail\AdminOrderPlacedMail;
use App\Mail\CustomerOrderPlacedMail;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmation implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public array $backoff = [10, 60, 300];

    /**
     * Create a new job instance.
     */
    public function __construct(public int $orderId)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $order = Order::findOrFail($this->orderId);

        // stop if the email already sent
        if ($order->confirmation_sent_at) return;

        // send an email to the company email
        Mail::to(config('shop.mail.address'))->send(new AdminOrderPlacedMail($order));
        if ($order->email) {
            // send confirmation email to the customer
            Mail::to($order->email)->send(new CustomerOrderPlacedMail($order));
        }

        $order->update(['confirmation_sent_at' => now()]);
    }

    public function failed(\Throwable $e)
    {
        Log::channel('queues')->error("SendOrderConfirmation failed:", [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}
