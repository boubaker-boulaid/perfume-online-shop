<?php

use App\Console\Commands\CancelUnpaidOrders;
use App\Console\Commands\SendPaymentReminder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(SendPaymentReminder::class)->everyFiveMinutes()->withoutOverlapping();

// the customer never opened whatsapp: give the stock back after 1h
Schedule::command(CancelUnpaidOrders::class, ['--hours=1', '--unopened'])->everyFiveMinutes()->withoutOverlapping();

// still not confirmed after 24h, even if whatsapp was opened
Schedule::command(CancelUnpaidOrders::class, ['--hours=24'])->everyFiveMinutes()->withoutOverlapping();