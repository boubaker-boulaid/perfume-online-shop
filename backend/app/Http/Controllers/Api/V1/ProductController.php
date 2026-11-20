<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\FiltersRequest;
use App\Http\Requests\V1\StoreProductRequest;
use App\Http\Requests\V1\UpdateProductRequest;
use App\Http\Resources\V1\ProductResource;
use App\Models\Product;
use App\Services\ProductService;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected ProductService $product_service) {}

    /**
     * Display a listing of the resource.
     */
    public function index(FiltersRequest $request)
    {
        $products = $this->product_service->getAdminProducts($request->validated());

        return $this->ok(ProductResource::collection($products), 'Produits récupérés.');
    }

    public function active(FiltersRequest $request)
    {
        $products = $this->product_service->getProducts($request->validated());

        return $this->ok(ProductResource::collection($products), 'Produits récupérés.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $product = $this->product_service->createProduct($request->validated(), $request->file('image'));

        return $this->created(new ProductResource($product), 'Produit créé.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return $this->okNoPgs(new ProductResource($product->load('category')),
            'Produit récupéré.');
    }

    public function showActive(string $slug)
    {
        return $this->okNoPgs(new ProductResource($this->product_service->getProduct($slug)),
            'Produit récupéré.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product = $this->product_service->updateProduct($product, $request->validated(), $request->file('image'));

        return $this->okNoPgs(new ProductResource($product), 'Produit mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->product_service->deleteProduct($product);

        return $this->noContent();
    }

    public function featured()
    {
        $products = $this->product_service->getFeatured();

        return $this->okNoPgs(ProductResource::collection($products), 'Produits en vedette récupérés.');
    }
}
