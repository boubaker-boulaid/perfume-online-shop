<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class Category extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'image_path', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool',
        'sort_order' => 'int',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
