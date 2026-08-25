<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Category;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'sku', 'price', 'compare_at_price', 'stock', 'image_path', 'is_active', 'is_featured'
    ];

    protected $casts = [
        'price' => 'decimal:2', 
        'compare_at_price' => 'decimal:2',
        'stock' => 'int',
        'is_active' => 'bool', 
        'is_featured' => 'bool'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
