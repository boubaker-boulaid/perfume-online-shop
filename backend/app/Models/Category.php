<?php

namespace App\Models;

use App\Observers\CatalogObserver;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(CatalogObserver::class)]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'image_path', 'is_active', 'sort_order',
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
