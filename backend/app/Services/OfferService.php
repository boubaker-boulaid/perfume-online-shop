<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Product;
use App\Services\Concerns\HandlesCache;
use App\Services\Concerns\HandlesSlugsAndImages;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

class OfferService
{
    use HandlesCache, HandlesSlugsAndImages;

    private const OFFERS_CACHE_SECONDS = 300;
    private const RELATIONS = ['bundle.category', 'products.category'];

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getCurrentOffers()
    {
        return $this->cached($this->versionedKey('catalog', 'offers'), self::OFFERS_CACHE_SECONDS, 
            fn () => Offer::current()->with(self::RELATIONS)->orderBy('sort_order')->orderBy('ends_at')->get());
    }

    public function getCurrentOffer(string $slug)
    {
        return Offer::current()->with(self::RELATIONS)->where('slug', $slug)->firstOrFail();
    }

    public function getAdminOffers()
    {
        return Offer::with(self::RELATIONS)->orderBy('sort_order')->latest()->paginate(10);
    }

    public function getAdminOrder(Offer $offer)
    {
        return $offer->load(self::RELATIONS);
    }

    public function createOffer(array $data, UploadedFile $image)
    {
        $data['slug'] = Product::findOrFail($data['product_id'])->slug;
        $data['image_path'] = $this->storeImage($image, 'offers');
        $data['sort_order'] ??= 0;
        $syncContent = $this->syncContent($data);

        try {
            $offer = DB::transaction(function () use ($data, $syncContent) {
                $offer = Offer::create($data);
                $offer->products()->sync($syncContent);

                return $offer;
            });
        } catch (Throwable $e) {
            $this->removeImage($data['image_path']); // no orphan image if the insert fails
            throw $e;
        }

        $this->bumpCacheVersion('catalog'); // sync dosnt fire the observer

        return $offer->load(self::RELATIONS);
    }

    public function updateOffer(Offer $offer, array $data, ?UploadedFile $image)
    {
        $oldImagePath = $offer->image_path;
        if ($image) {
            $data['iamge_path'] = $this->storeImage($image, 'offers');
        }

        $syncContent = isset($data['product_ids']) ? $this->syncContent($data) : null;

        try {
            DB::transaction(function () use ($data, $offer, $syncContent) {
                $offer->update($data);

                if ($syncContent !== null) {
                    $offer->products()->sync($syncContent);
                }

                return $offer;
            });
        } catch (Throwable $e) {
            if ($image) {
                $this->removeImage($data['image_path']);
            }

            throw $e;
        }

        if ($image) {
            $this->removeImage($oldImagePath);
        }

        $this->bumpCacheVersion('catalog');

        return $offer->load(self::RELATIONS);
    }

    public function deleteOffer(Offer $offer)
    {
        $offer->delete();
        $this->removeImage($offer->image_path);
    }

    // turns the product_ids array into what sync() wants: [product id => [is_free => bool]]
    // adding & befor a param means (by reference) it allows the function to work with the real var not a copy of it so it can change the real var
    private function syncContent(array &$data) 
    {
        $row = [];

        foreach ($data['product_ids'] as $id) {
            $row[$id] = ['is_free' => false];
        }

        if (!empty($data['free_product_id'])) {
            $row[$data['free_product_id']] = ['is_free' => true];
        }

        // format $data to only keep the offers table's columns
        unset($data['free_product_id'], $data['product_ids'], $data['image']); 

        return $row;
    }
}
