<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrderFiltersRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected OrderService $order_service)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(OrderFiltersRequest $request)
    {
        $orders = $this->order_service->getOrders($request->validated());

        return $this->ok(OrderResource::collection($orders), 'Orders retrieved.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $order = $this->order_service->place($request->validated());

        return $this->created([
            'order_number' => $order->order_number,
            'total' => $order->total,
            'whatsapp_link' => $order->whatsappLink(),
            'whatsapp_opened_url' => URL::temporarySignedRoute('customer.orders.whatsapp-opened', now()->addMinutes(30), [
                'orderNumber' => $order->order_number
            ]),
        ], 'The order was created successfully.');
    }

    public function whatsappOpened(string $orderNumber)
    {
        $this->order_service->updateWhatsappOpened($orderNumber);
        return $this->noContent();
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return $this->okNoPgs(new OrderResource($this->order_service->getOrder($order)), 'Order retrieved.');
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
