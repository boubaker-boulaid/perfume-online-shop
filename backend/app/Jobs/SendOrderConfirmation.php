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
    public function __construct(public Order $order)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->order->confirmation_sent_at) {
            return;
        }
        // send an email to the company email
        Mail::to(config('mail.admin_address'))->send(new AdminOrderPlacedMail($this->order));
        if ($this->order->email) {
            // send confirmation email to the customer 
            Mail::to($this->order->email)->send(new CustomerOrderPlacedMail($this->order));
        }
        
        $this->order->forceFill([
            'confirmation_sent_at' => now()
        ])->save();
    }

    public function failed(\Throwable $e)
    {
        Log::channel('queues')->error("SendOrderConfirmation failed:", [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}
