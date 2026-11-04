<?php

namespace App\Services;

use App\Models\Category;
use App\Services\Concerns\HandlesCache;
use App\Services\Concerns\HandlesSlugsAndImages;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Paginator;
use Throwable;

class CategoryService
{
    use HandlesSlugsAndImages, HandlesCache;

    private const CATEGORIES_CACHE_SECONDS = 3600;

    public function getCategories()
    {
        $key = $this->versionedKey('catalog', 'categories', 'page', (string) Paginator::resolveCurrentPage());

        return $this->cached($key, self::CATEGORIES_CACHE_SECONDS,
            fn() => Category::active()->withCount('products')->latest()->paginate(10));
    }

    public function getAdminCategories()
    {
        return Category::withCount('products')->latest()->paginate(10);
    }

    public function createCategory(array $data, ?UploadedFile $image)
    {
        $data['slug'] = $this->uniqueSlug(Category::class, $data['name']);
        unset($data['image']);

        if ($image) {
            $data['image_path'] = $this->storeImage($image, 'categories');
        }

        try {
            $category = Category::create($data);
        } catch (Throwable $e) {
            // don't leave an orphan image behind if the insert fails
            $this->removeImage($data['image_path'] ?? null);
            throw $e;
        }

        return $category->loadCount('products');
    }

    public function updateCategory(Category $category, array $data, ?UploadedFile $image)
    {
        $oldImage = $category->image_path;
        unset($data['image']);

        if ($image) {
            $data['image_path'] = $this->storeImage($image, 'categories');
        }

        try {
            $category->update($data);
        } catch (Throwable $e) {
            // don't leave the new image orphaned if the update fails
            $this->removeImage($data['image_path'] ?? null);
            throw $e;
        }

        // only remove the old image once the new one is saved
        if ($image) {
            $this->removeImage($oldImage);
        }

        return $category->loadCount('products');
    }

    public function deleteCategory(Category $category)
    {
        // products are restricted on delete, so they have to be moved or removed first
        abort_if($category->products()->exists(), 409, 'Cannot delete a category that still has products.');

        $category->delete();

        // remove the image only once the row is gone
        $this->removeImage($category->image_path);
    }
}
