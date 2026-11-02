<?php

namespace App\Console\Commands;

use App\Mail\CustomerPaymentReminderMail;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

#[Signature('orders:send-payment-reminders')]
#[Description('Send payment reminders to customers.')]
class SendPaymentReminder extends Command
{
    /**
    * Execute the console command.
    */
    public function handle()
    {
        $orders = Order::whereNull('whatsapp_opened_at')->whereNull('reminder_sent_at')->where('status', 'pending')
                    ->whereNotNull('email')->where('created_at', '<', now()->subMinutes(30))
                    // skip orders older than 1h, they get cancelled anyway (e.g. after the scheduler was down)
                    ->where('created_at', '>', now()->subHour())->get();
        $orders->each(function ($order) {
            Mail::to($order->email)->send(new CustomerPaymentReminderMail($order));
            $order->update([
                'reminder_sent_at' => now(),
            ]);
        });

        $this->info("{$orders->count()} reminders queued.");
    }
}
