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

    public function history()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function whatsappMessage():string
    {
        // local helper for formating the money
        $money = fn($v) => number_format((float) $v, 2, ',', ''). ' DH';

        $lines = collect([
            "New Order {$this->order_number}",
            "",
        ])->concat($this->items->map(
            fn ($i) => "{$i->product_name}: quantity {$i->quantity} / cost {$money($i->line_total)} " 
        ))->concat([
            "",
            "Shipping: ". ($this->shipping_cost == 0 ? "free" : $money($this->shipping_cost)),
            "Total: {$money($this->total)}",
            "Name: {$this->customer_name}",
            "City: {$this->city}",
            "Address: {$this->address}",  
        ]);

        if ($this->note) $lines->push($this->note);

        return $lines->implode("\n");
    }

    public function whatsappLink():string
    {
        return 'https://wa.me/'. config('shop.whatsapp.number') . '?text='. rawurlencode($this->whatsappMessage());
    }
}
