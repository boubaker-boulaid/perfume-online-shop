<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'idempotency_key', 
        'customer_name',
        'phone',
        'email',
        'city',
        'address',
        'note',
        'subtotal',
        'shipping_cost',
        'confirmation_sent_at',
        'total',
        'status',
        'payment_status',
        'whatsapp_opened_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'confirmation_sent_at' => 'datetime',
        'total' => 'decimal:2',
        'whatsapp_opened_at' => 'datetime'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
}
