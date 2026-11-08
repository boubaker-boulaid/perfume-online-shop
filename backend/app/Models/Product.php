<?php

namespace App\Models;

use App\Observers\CatalogObserver;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(CatalogObserver::class)]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'notes',
        'sort_order',
        'sku',
        'price',
        'compare_at_price',
        'stock',
        'image_path',
        'is_active',
        'is_featured',
        'is_offer',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'stock' => 'int',
        'is_active' => 'bool',
        'is_featured' => 'bool',
        'is_offer' => 'bool',
    ];

    // scope the query to include only active products
    public function scopeActive(Builder $query)
    {
        $query->where('is_active', true);
    }

    // scope a query to what customers can see: active products in an active category
    public function scopeVisible(Builder $query)
    {
        $query->active()->whereRelation('category', 'is_active', true);
    }

    // prevent the offers sets being listed with the normal products
    public function scopeListed(Builder $query)
    {
        $query->visible()->where('is_offer', false);
    }

    // scope a query to include only featured products
    public function scopeFeatured(Builder $query)
    {
        $query->where('is_featured', true);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
