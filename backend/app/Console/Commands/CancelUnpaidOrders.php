<?php

namespace App\Console\Commands;

use App\Services\OrderService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('orders:cancel-unpaid {--hours=1 : Cancel pending orders older than this many hours} {--unopened : Only cancel orders whose WhatsApp link was never opened}')]
#[Description('Cancel unpaid pending orders and restore their stock.')]
class CancelUnpaidOrders extends Command
{
    /**
    * Execute the console command.
    */
    public function handle(OrderService $order_service)
    {
        $hours = filter_var($this->option('hours'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($hours === false) {
            $this->error('The --hours option must be a whole number of at least 1.');
            return self::FAILURE;
        }

        $cancelled = $order_service->cancelUnpaidOrders($hours, (bool) $this->option('unopened'));

        $this->info("{$cancelled} orders cancelled.");
    }
}
