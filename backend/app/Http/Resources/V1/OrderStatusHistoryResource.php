<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusHistoryResource extends JsonResource
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
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'note' => $this->note,
            'user_id' => $this->user_id, // which admin made the change
            'changed_by' => $this->whenLoaded('user', fn () => $this->user?->name),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
