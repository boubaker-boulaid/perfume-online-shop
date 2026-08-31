<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\FiltersRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of the resource.
     */
    public function index(FiltersRequest $request)
    {
        $validated = $request->validated();

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

        $products = $query->with('category')->where('is_active', true)->paginate(10);

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
    public function show(string $id)
    {
        //
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
}
