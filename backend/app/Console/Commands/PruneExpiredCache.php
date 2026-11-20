<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('cache:prune-expired')]
#[Description('Delete expired rows from the database cache table.')]
class PruneExpiredCache extends Command
{
    /**
     * The database store only removes an expired row when that key is read again. Bumping the
     * catalog version means old keys are never read again, so without this the table only grows.
     */
    public function handle()
    {
        $store = config('cache.stores.'.config('cache.default'));

        if (($store['driver'] ?? null) !== 'database') {
            $this->info('The default cache store is not the database, nothing to prune.');

            return self::SUCCESS;
        }

        $deleted = DB::connection($store['connection'] ?? null)
            ->table($store['table'] ?? 'cache')
            ->where('expiration', '<=', now()->getTimestamp())
            ->delete();

        $this->info("{$deleted} expired cache rows deleted.");

        return self::SUCCESS;
    }
}
