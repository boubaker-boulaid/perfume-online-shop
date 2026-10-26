<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\OrderItemResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'idempotency_key' => $this->idempotency_key,
            'customer_name' => $this->customer_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'city' => $this->city,
            'address' => $this->address,
            'note' => $this->note,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'shipping_cost' => $this->shipping_cost,
            'subtotal' => $this->subtotal,
            'total' => $this->total,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'confirmation_sent_at' => $this->confirmation_sent_at?->toISOString(),
            'whatsapp_opened_at' => $this->whatsapp_opened_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString()
        ];
    }
}
