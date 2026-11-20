<?php

namespace App\Services\Concerns;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

trait HandlesCache
{
    // the cache is only a speed trick: if it is down the query still runs and the shop gets slower, never broken.
    // errors thrown by $fn itself (a failing query, a 404) are not caught here, they go back to the caller
    protected function cached(string $key, int $seconds, callable $fn)
    {
        try {
            $value = Cache::get($key);
            if ($value !== null) {
                return $value;
            }
        } catch (Throwable $e) {
            Log::warning("Cache read failed for [{$key}].", ['exception' => $e]);

            return $fn();
        }

        $value = $fn();

        try {
            Cache::put($key, $value, $seconds);
        } catch (Throwable $e) {
            Log::warning("Cache write failed for [{$key}].", ['exception' => $e]);
        }

        return $value;
    }

    // e.g. versionedKey('catalog', 'product', 'oud-royal') => "catalog:v3:product:oud-royal"
    protected function versionedKey(string $name, string ...$parts): string
    {
        return "{$name}:v{$this->cacheVersion($name)}:".implode(':', $parts);
    }

    // the version is part of the cache keys, so bumping it makes every old entry unreachable at once
    protected function cacheVersion(string $name): int
    {
        try {
            return (int) Cache::rememberForever("{$name}:version", fn () => 1);
        } catch (Throwable $e) {
            return 1;
        }
    }

    protected function bumpCacheVersion(string $name): void
    {
        // wait for the transaction to commit, otherwise a visitor could cache the old data under the new version
        DB::afterCommit(function () use ($name) {
            try {
                $this->cacheVersion($name); // increment does nothing on a missing key, make sure it exists
                Cache::increment("{$name}:version");
            } catch (Throwable $e) {
                Log::warning("Cache version bump failed for [{$name}].", ['exception' => $e]);
            }
        });
    }
}
