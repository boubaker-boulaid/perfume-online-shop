<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('shop:demo-reset')]
#[Description('Wipe the database and seed the demo catalog and admin again (demo mode only).')]
class ResetDemo extends Command
{
    /**
     * The public demo starts from the same fake catalog every time: whatever visitors changed in
     * the admin, or ordered, is thrown away. It deletes every row, so it refuses to run unless
     * SHOP_DEMO=true: on a real shop, or on your own computer, nothing happens.
     */
    public function handle()
    {
        if (! config('shop.demo')) {
            $this->error('Demo mode is off (SHOP_DEMO is not true): nothing was reset.');

            return self::FAILURE;
        }

        $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);

        $this->info('The demo is fresh. Admin login: '.config('shop.admin.email'));

        return self::SUCCESS;
    }
}
