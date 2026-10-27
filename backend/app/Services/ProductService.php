<?php

namespace App\Services;

use App\Models\Product;

class ProductService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getProducts(array $filters)
    {
        $query = Product::query();
        $query->when($validated['q'] ?? null, fn($q, $search) => $q->where('name', 'like', '%' . $search . '%'))
            ->when($validated['category'] ?? null, fn($q, $cat) => $q->whereRelation('category', 'slug', $cat))
            ->when($validated['min_price'] ?? null, fn($q, $min) => $q->where('price', '>=', $min))
            ->when($validated['max_price'] ?? null, fn($q, $max) => $q->where('price', '<=', $max))
        ;

        match ($validated['sort'] ?? null) {
            'price_desc' => $query->orderByDesc('price'),
            'price_asc' => $query->orderBy('price'),
            'oldest' => $query->oldest(),
            'newest' => $query->latest(),
            default => $query->latest(),
        };

        return $query->with('category')->where('is_active', true)->paginate(10);
    }

    public function getProduct(string $slug)
    {
        return Product::with('ctegory')->where('is_active', true)->where('slug', $slug)
                    ->firstOrFail();
    }

}
