<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

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
        $query = $this->filteredProducts($filters);

        return $query->with('category')->active()->paginate(10);
    }

    public function getAdminProducts(array $filters)
    {
        $query = $this->filteredProducts($filters);

        return $query->with('category')->paginate(10);
    }

    private function filteredProducts(array $filters) 
    {
        $query = Product::query();
        $query->when($filters['q'] ?? null, fn($q, $search) => $q->where('name', 'like', '%' . $search . '%'))
            ->when($filters['category'] ?? null, fn($q, $cat) => $q->whereRelation('category', 'slug', $cat))
            ->when($filters['min_price'] ?? null, fn($q, $min) => $q->where('price', '>=', $min))
            ->when($filters['max_price'] ?? null, fn($q, $max) => $q->where('price', '<=', $max))
        ;

        match ($filters['sort'] ?? null) {
            'price_desc' => $query->orderByDesc('price'),
            'price_asc' => $query->orderBy('price'),
            'oldest' => $query->oldest(),
            'newest' => $query->latest(),
            default => $query->latest(),
        };

        return $query;
    }

    public function getProduct(string $slug)
    {
        return Product::with('category')->active()->where('slug', $slug)
                    ->firstOrFail();
    }

    public function getAdminProduct(string $slug)
    {
        return Product::with('category')->where('slug', $slug)->firstOrFail();
    }

    public function getFeatured()
    {
        return Product::with('category')->active()->featured()
                    ->inRandomOrder()->take(5)->get();
    }

    public function createProduct(array $data, UploadedFile $image)
    {
        $data['slug'] = $data['slug'] ?? $this->uniqueSlug($data['name']);
        $data['image_path'] = $image->store('products', 'public');
        unset($data['image']);

        try {
            $product = Product::create($data);
        } catch (Throwable $e) {
            // don't leave an orphan image behind if the insert fails
            Storage::disk('public')->delete($data['image_path']);
            throw $e;
        }

        return $product->load('category');
    }

    // generate a slug from the name, adding a suffix (-2, -3...) when it's already taken
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
