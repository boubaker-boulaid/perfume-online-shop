<?php

namespace App\Models;

use App\Observers\CatalogObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Builder;

#[ObservedBy(CatalogObserver::class)]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'notes', 'sort_order', 'sku', 'price', 'compare_at_price', 'stock', 'image_path', 'is_active', 'is_featured'
    ];

    protected $casts = [
        'price' => 'decimal:2', 
        'compare_at_price' => 'decimal:2',
        'stock' => 'int',
        'is_active' => 'bool', 
        'is_featured' => 'bool'
    ];
    
    // scope the query to include only active products 
    public function scopeActive(Builder $query)
    {
        $query->where('is_active', true);
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
