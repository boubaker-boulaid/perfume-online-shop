<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\V1\ProductResource;

class OfferResource extends JsonResource
{
    
    /**
     * Transform the resource into an array.
    *
    * @return array<string, mixed>
    */
    public function toArray(Request $request): array
    {
        $free = $this->products->firstWhere('pivot.is_free', true);
        // multipy all prices by 100 to turn them from dh/deimal to cents/integer to avoid clacul mistakes
        $regular = (int) round($this->products->sum(fn ($p) => $p->price * 100)); // the regular price of the products in the set 
        $price = (int) round($this->bundle->price * 100); // the offer price 

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'image_path' => Storage::disk('public')->url($this->image_path),
            'starts_at' => $this->starts_at->toISOString(),
            'ends_at' => $this->ends_at->toISOString(),
            'terms' => $this->terms ?? [],
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'set' => new ProductResource($this->bundle),
            'products' => ProductResource::collection($this->products->where('pivot.is_free', false)->values()),
            'free_product' => $free ? new ProductResource($free) : null,
            'regular_price' => number_format($regular / 100, 2, '.', ''), // turn the price back to dh
            'saving' => number_format(($regular - $price) / 100, 2, '.', ''), // turn the price back to dh
            'discount_percent' => $regular > 0 ? intdiv(($regular - $price) * 100, $regular) : 0,
        ];
    }
}
