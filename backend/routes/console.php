<?php

use App\Console\Commands\CancelUnpaidOrders;
use App\Console\Commands\PruneExpiredCache;
use App\Console\Commands\SendPaymentReminder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// if a run crashes, its lock frees itself after this long. the default of 24h would stop the task for a day
$lockMinutes = 10;

Schedule::command(SendPaymentReminder::class)->everyFiveMinutes()->withoutOverlapping($lockMinutes);

// the customer never opened whatsapp: give the stock back after 1h
Schedule::command(CancelUnpaidOrders::class, ['--hours=1', '--unopened'])->everyFiveMinutes()->withoutOverlapping($lockMinutes);

// still not confirmed after 24h, even if whatsapp was opened
Schedule::command(CancelUnpaidOrders::class, ['--hours=24'])->everyFiveMinutes()->withoutOverlapping($lockMinutes);

// old catalog versions in the database cache are never read again, so they have to be removed
Schedule::command(PruneExpiredCache::class)->hourly()->withoutOverlapping($lockMinutes);
