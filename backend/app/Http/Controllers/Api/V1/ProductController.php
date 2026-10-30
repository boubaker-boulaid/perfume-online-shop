<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\FiltersRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use App\Services\ProductService;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected ProductService $product_service)
    {
        
    }
    /**
     * Display a listing of the resource.
     */
    public function index(FiltersRequest $request)
    {
        $products = $this->product_service->getAdminProducts($request->validated());

        return $this->ok(ProductResource::collection($products), 'Products retrieved.');
    }

    public function active(FiltersRequest $request)
    {
        $products = $this->product_service->getProducts($request->validated());

        return $this->ok(ProductResource::collection($products), 'Products retrieved.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        return $this->okNoPgs(new ProductResource($this->product_service->getAdminProduct($slug)), 
            'Product Retrieved');
    }

    public function showActive(string $slug)
    {
        return $this->okNoPgs(new ProductResource($this->product_service->getProduct($slug)),
            'Product Retrieved');
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function featured()
    {
        $products = $this->product_service->getFeatured();
        return $this->okNoPgs(ProductResource::collection($products), 'Featured products retrieved');
    }
}
