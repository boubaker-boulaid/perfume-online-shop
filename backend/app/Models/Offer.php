<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;

class Offer extends Model
{
    protected $fillable = [
        'product_id',
        'title',
        'slug',
        'tagline',
        'description',
        'image_path',
        'terms',
        'starts_at',
        'ends_at',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'terms' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'bool',
        'sort_order' => 'int',
    ];

    // the offer that is stored in products table as a set (the ones with is_offer true)
    public function bundle()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // the products inside the set including the free ones 
    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('is_free');
    }

    // what customer see (active, started, not over and visible)
    public function scopeCurrent(Builder $query)
    {
        $query->where('is_active', true)->whereValueBetween(now(), ['starts_at', 'ends_at'])
            ->whereHas('bundle', fn ($b) => $b->visible());
    }

    public function isCurrent(): bool
    {
        return $this->is_active && $this->starts_at->lte(now()) && $this->ends_at->gte(now());
    }
}
