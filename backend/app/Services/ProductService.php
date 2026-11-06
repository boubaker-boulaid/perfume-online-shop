<?php

namespace App\Services;

use App\Models\Product;
use App\Services\Concerns\HandlesCache;
use App\Services\Concerns\HandlesSlugsAndImages;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Paginator;
use Throwable;

class ProductService
{
    use HandlesCache, HandlesSlugsAndImages;

    private const PRODUCTS_CACHE_SECONDS = 600;

    private const PRODUCT_CACHE_SECONDS = 600;

    private const FEATURED_CACHE_SECONDS = 900;

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getProducts(array $filters)
    {
        // every filter combination and page gets its own entry
        ksort($filters);
        $key = $this->versionedKey('catalog', 'products', md5(json_encode([$filters, Paginator::resolveCurrentPage()])));

        return $this->cached($key, self::PRODUCTS_CACHE_SECONDS,
            // only validated filters go in the links: this page is cached and shared between visitors
            fn () => $this->filteredProducts($filters)->with('category')->visible()->paginate(10)->appends($filters));
    }

    public function getAdminProducts(array $filters)
    {
        $query = $this->filteredProducts($filters);

        return $query->with('category')->paginate(10)->appends($filters);
    }

    private function filteredProducts(array $filters)
    {
        $query = Product::query();
        $query->when($filters['q'] ?? null, fn ($q, $search) => $q->where('name', 'like', '%'.$search.'%'))
            ->when($filters['category'] ?? null, fn ($q, $cat) => $q->whereRelation('category', 'slug', $cat))
            // isset, because a price of 0 is a real filter
            ->when(isset($filters['min_price']), fn ($q) => $q->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn ($q) => $q->where('price', '<=', $filters['max_price']));

        match ($filters['sort'] ?? null) {
            'price_desc' => $query->orderByDesc('price'),
            'price_asc' => $query->orderBy('price'),
            'oldest' => $query->oldest(),
            'newest' => $query->latest(),
            default => $query->orderBy('sort_order')->latest(),
        };

        return $query;
    }

    public function getProduct(string $slug)
    {
        // firstOrFail throws before anything is stored, so unknown slugs are never cached
        return $this->cached($this->versionedKey('catalog', 'product', $slug), self::PRODUCT_CACHE_SECONDS,
            fn () => Product::with('category')->visible()->where('slug', $slug)->firstOrFail());
    }

    public function getFeatured()
    {
        // cache all featured products and pick 5 per request, so the homepage still changes on every visit
        $featured = $this->cached($this->versionedKey('catalog', 'featured'), self::FEATURED_CACHE_SECONDS,
            fn () => Product::with('category')->visible()->featured()->get());

        return $featured->shuffle()->take(5)->values();
    }

    public function createProduct(array $data, UploadedFile $image)
    {
        $data['slug'] = $this->uniqueSlug(Product::class, $data['name']);
        $data['sort_order'] ??= 0; // an empty form field arrives as null, and the column can't be null
        $data['image_path'] = $this->storeImage($image, 'products');
        unset($data['image']);

        try {
            $product = Product::create($data);
        } catch (Throwable $e) {
            // don't leave an orphan image behind if the insert fails
            $this->removeImage($data['image_path']);
            throw $e;
        }

        // re-read the row, so the defaults set by the database (is_active...) are in the response
        return $product->refresh()->load('category');
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
