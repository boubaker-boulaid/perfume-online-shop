<?php

namespace App\Observers;

use App\Services\Concerns\HandlesCache;
use Illuminate\Database\Eloquent\Model;

// runs on every product/category save or delete (admin, seeder, tinker...)
// and makes all cached catalog entries (product list, product pages, featured, categories) stale
class CatalogObserver
{
    use HandlesCache;

    public function saved(Model $model): void
    {
        $this->bumpCacheVersion('catalog');
    }

    public function deleted(Model $model): void
    {
        $this->bumpCacheVersion('catalog');
    }
}
