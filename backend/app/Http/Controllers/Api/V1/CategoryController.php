<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected CategoryService $category_service)
    {

    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = $this->category_service->getAdminCategories();

        return $this->ok(CategoryResource::collection($categories), 'Categories retrieved');
    }

    public function active()
    {
        $categories = $this->category_service->getCategories();

        return $this->ok(CategoryResource::collection($categories), 'Categories retrieved');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = $this->category_service->createCategory($request->validated(), $request->file('image'));

        return $this->created(new CategoryResource($category), 'Category created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return $this->okNoPgs(new CategoryResource($category->loadCount('products')),
            'Category Retrieved');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category = $this->category_service->updateCategory($category, $request->validated(), $request->file('image'));

        return $this->okNoPgs(new CategoryResource($category), 'Category updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $this->category_service->deleteCategory($category);

        return $this->noContent();
    }
}
