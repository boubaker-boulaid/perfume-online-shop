<?php

namespace Tests\Concerns;

use App\Models\Offer;
use App\Models\Product;

trait BuildsOffers
{
    /**
     * A current offer: a hidden set at 180.00 with the perfumes inside it, one per stock given.
     * $offer overrides the offer's columns, $set the set's columns.
     *
     * @return array{Offer, Product, \Illuminate\Support\Collection<int, Product>}
     */
    private function makeOffer(array $insideStocks = [10, 10], array $offer = [], array $set = [], ?Product $free = null): array
    {
        $inside = collect($insideStocks)->map(fn ($stock) => Product::factory()->create(['stock' => $stock]));
        $bundle = Product::factory()->create(['price' => 180, 'stock' => 10, 'is_offer' => true, ...$set]);

        $model = Offer::create([
            'product_id' => $bundle->id,
            'slug' => $bundle->slug,
            'title' => 'Collection Gissah',
            'image_path' => 'offers/test.webp',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            ...$offer,
        ]);

        $rows = $inside->mapWithKeys(fn ($p) => [$p->id => ['is_free' => false]]);
        if ($free) {
            $rows[$free->id] = ['is_free' => true];
        }
        $model->products()->sync($rows->all());

        return [$model, $bundle, $inside];
    }
}
