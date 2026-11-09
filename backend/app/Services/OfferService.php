<?php

namespace App\Services;

use App\Models\Offer;
use App\Services\Concerns\HandlesCache;
use App\Services\Concerns\HandlesSlugsAndImages;

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
}
