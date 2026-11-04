<?php

namespace App\Models;

use App\Observers\CatalogObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;

#[ObservedBy(CatalogObserver::class)]
class Category extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'image_path', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool',
        'sort_order' => 'int',
    ];

    // scope a query to include only active categories 
    public function scopeActive(Builder $query)
    {
        $query->where('is_active', true);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
