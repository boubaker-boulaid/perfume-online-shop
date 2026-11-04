<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\Concerns\HandlesCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// runs on every product/category save or delete (admin, seeder, tinker...)
// and makes all cached catalog entries (product list, product pages, featured, categories) stale
class CatalogObserver
{
    use HandlesCache;

    public function updated(Model $model): void
    {
        // price changes go to the admin log: who changed it, from what, to what
        if ($model instanceof Product && $model->wasChanged('price')) {
            Log::channel('admin')->info('product.price_changed', [
                'product_id' => $model->id,
                'slug' => $model->slug,
                'from' => $model->getOriginal('price'),
                'to' => $model->price,
                'by' => Auth::id() ?? 'system',
            ]);
        }
    }

    public function saved(Model $model): void
    {
        $this->bumpCacheVersion('catalog');
    }

    public function deleted(Model $model): void
    {
        $this->bumpCacheVersion('catalog');
    }
}
