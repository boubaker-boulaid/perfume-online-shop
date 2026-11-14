<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreOfferRequest;
use App\Http\Requests\V1\UpdateOfferRequest;
use App\Http\Resources\V1\OfferResource;
use App\Models\Offer;
use App\Services\OfferService;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected OfferService $offer_service) {}

    public function active()
    {
        return $this->okNoPgs(OfferResource::collection($this->offer_service->getCurrentOffers()), 'Offres récupérées.');
    }

    public function showActive(string $slug)
    {
        return $this->okNoPgs(new OfferResource($this->offer_service->getCurrentOffer($slug)), 'Offre récupérée.');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->ok(OfferResource::collection($this->offer_service->getAdminOffers()), 'Offres récupérées.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOfferRequest $request)
    {
        $product = $this->offer_service->createOffer($request->validated(), $request->file('image'));
        return $this->created(new OfferResource($product), 'Offre créée.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Offer $offer)
    {
        return $this->okNoPgs(new OfferResource($this->offer_service->getAdminOffer($offer)), 'Offre récupérée.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOfferRequest $request, Offer $offer)
    {
        $offer = $this->offer_service->updateOffer($offer, $request->validated(), $request->file('image'));
        return $this->okNoPgs(new OfferResource($offer), 'Offre mise à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Offer $offer)
    {
        $this->offer_service->deleteOffer($offer);
        return $this->noContent();
    }
}
