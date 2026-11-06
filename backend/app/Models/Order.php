<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\URL;

class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

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
        'reminder_sent_at',
        'total',
        'status',
        'payment_status',
        'whatsapp_opened_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'confirmation_sent_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'total' => 'decimal:2',
        'whatsapp_opened_at' => 'datetime'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function history()
    {
        return $this->hasMany(OrderStatusHistory::class)->oldest();
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

    // for the frontend to call when the customer opens whatsapp. it must outlive the 1 hour cancel window
    public function whatsappOpenedUrl(): string
    {
        return URL::temporarySignedRoute('customer.orders.whatsapp-opened', now()->addHours(2), [
            'orderNumber' => $this->order_number,
        ]);
    }

    // for emails: records that whatsapp was opened, then redirects to it.
    // a plain wa.me link can't tell us it was used, and the order would be cancelled after 1 hour
    public function whatsappRedirectUrl(): string
    {
        return URL::temporarySignedRoute('customer.orders.whatsapp-redirect', now()->addDay(), [
            'orderNumber' => $this->order_number,
        ]);
    }

    // status allowed transitions the key is the current status and the value is statuses it can move to 
    public const TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => []
    ];

    public function canTransitionTo(string $status): bool
    {
        // check if the new status is in the array(value in TRANSITIONS) of the current status
        return in_array($status, self::TRANSITIONS[$this->status] ?? [], true);
    }
}
