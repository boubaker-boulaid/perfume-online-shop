<?php

namespace App\Services;

use App\Models\Product;
use App\Services\Concerns\HandlesSlugsAndImages;
use Illuminate\Http\UploadedFile;
use Throwable;

class ProductService
{
    use HandlesSlugsAndImages;

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

    public function getFeatured()
    {
        return Product::with('category')->active()->featured()
            ->inRandomOrder()->take(5)->get();
    }

    public function createProduct(array $data, UploadedFile $image)
    {
        $data['slug'] = $this->uniqueSlug(Product::class, $data['name']);
        $data['image_path'] = $this->storeImage($image, 'products');
        unset($data['image']);

        try {
            $product = Product::create($data);
        } catch (Throwable $e) {
            // don't leave an orphan image behind if the insert fails
            $this->removeImage($data['image_path']);
            throw $e;
        }

        return $product->load('category');
    }

    public function updateProduct(Product $product, array $data, ?UploadedFile $image)
    {
        $oldImage = $product->image_path;
        unset($data['image']);

        if ($image) {
            $data['image_path'] = $this->storeImage($image, 'products');
        }

        try {
            $product->update($data);
        } catch (Throwable $e) {
            // don't leave the new image orphaned if the update fails
            if ($image) {
                $this->removeImage($data['image_path']);
            }
            throw $e;
        }

        // only remove the old image once the new one is saved
        if ($image) {
            $this->removeImage($oldImage);
        }

        return $product->load('category');
    }

    public function deleteProduct(Product $product)
    {

        $product->delete();

        $this->removeImage($product->image_path);
    }
}
