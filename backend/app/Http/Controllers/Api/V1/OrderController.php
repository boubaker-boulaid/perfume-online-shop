<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\OrderFiltersRequest;
use App\Http\Requests\V1\StoreOrderRequest;
use App\Http\Requests\V1\UpdateStatusRequest;
use App\Http\Resources\V1\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

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

        $data = [
            'order_number' => $order->order_number,
            'total' => $order->total,
            'whatsapp_link' => $order->whatsappLink(),
            'whatsapp_opened_url' => $order->whatsappOpenedUrl(),
        ];

        // a retry with the same idempotency key gets the existing order back
        return $order->wasRecentlyCreated
            ? $this->created($data, 'The order was created successfully.')
            : $this->okNoPgs($data, 'The order was already placed.');
    }

    public function whatsappOpened(string $orderNumber)
    {
        $this->order_service->updateWhatsappOpened($orderNumber);
        return $this->noContent();
    }

    // the link in the emails: a cancelled order has nothing left to send, so go back to the shop
    public function whatsappRedirect(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->status === 'cancelled') {
            return redirect()->away(config('app.frontend_url'));
        }

        $this->order_service->updateWhatsappOpened($orderNumber);

        return redirect()->away($order->whatsappLink());
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

    public function status(Order $order, UpdateStatusRequest $request)
    {
        $validated = $request->validated();
        $order = $this->order_service->changeStatus($order, $validated['status'], $request->user(), $validated['note'] ?? null);

        return $this->okNoPgs(new OrderResource($this->order_service->getOrder($order)), 'Order status updated.');
    }
}
