<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Jobs\SendOrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function place(array $data)
    {
        try {
            return DB::transaction(function () use ($data) {
                // check if another order with the same idempotency_key already exists
                $orderExists = Order::where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
                if ($orderExists) {
                    if (is_null($orderExists->confirmation_sent_at)) {
                        SendOrderConfirmation::dispatch($orderExists->id);
                    }
                    return $orderExists;
                }

                $products = $this->lockAndValidateProduct($data['items']);
                // calculate the total
                $total = collect($data['items'])->sum(function ($item) use ($products) {
                    $product = $products->get($item['product_id']);
                    return $product->price * $item['quantity'];
                });

                $orderNumber = $this->generateOrderNumber();

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'idempotency_key' => $data['idempotency_key'],
                    'customer_name' => $data['customer_name'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'city' => $data['city'],
                    'address' => $data['address'],
                    'note' => $data['note'] ?? null,
                    'subtotal' => $total,
                    'total' => $total
                ]);

                $this->saveOrderItems($order, $products, $data['items']);
                $order->load('items');

                SendOrderConfirmation::dispatch($order->id);

                Log::channel('orders')->info("Order placed", [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total' => $order->total,
                    'items' => $order->items->count()
                ]);

                return $order;
            });
        } catch (InsufficientStockException $e) {
            throw $e;
        } catch (UniqueConstraintViolationException $e) {
            return Order::where('idempotency_key', $data['idempotency_key'])->firstOrFail();
        } catch (\Exception $e) {
            Log::channel('daily')->error("Failed to place order: {$e->getMessage()}", [
                'payload' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function lockAndValidateProduct(array $items)
    {
        $productsIds = collect($items)->pluck('product_id');
        $products = Product::whereIn('id', $productsIds)->lockForUpdate()->get()->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw new ModelNotFoundException('Product with id ' . $item['product_id'] . ' not found.');
            }

            if ($product->stock < $item['quantity']) {
                throw new InsufficientStockException($product->name, $item['quantity'], $product->stock);
            }

            $product->decrement('stock', $item['quantity']);
        }

        return $products;
    }

    private function generateOrderNumber()
    {
        $year = now()->year;
        // get the sequence of the current year and lock the table to prevant having the same name for several orders placed at the same time 
        $sequence = DB::table('order_sequences')->where('year', $year)->lockForUpdate()->first();

        if (!$sequence) {
            // manualy create the first sequence
            DB::table('order_sequences')->insert([
                'year' => $year,
                'last_number' => 1
            ]);
            $number = 1;
        } else {
            $number = $sequence->last_number + 1;
            // increase the last_number of the last sequence by 1
            DB::table('order_sequences')->where('year', $year)->update([
                'last_number' => $number
            ]);
        }

        return sprintf('ORD-%d-%06d', $year, $number);
    }

    private function saveOrderItems(Order $order, Collection $products, array $items)
    {
        collect($items)->each(function ($i) use ($products, $order) {
            $p = $products->get($i['product_id']);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $p->id,
                'product_name' => $p->name,
                'unit_price' => $p->price,
                'quantity' => $i['quantity'],
                'line_total' => $i['quantity'] * $p->price
            ]);
        });
    }


    public function updateWhatsappOpened(string $orderNumber)
    {
        Order::where('order_number', $orderNumber)->whereNull('whatsapp_opened_at')->update([
            'whatsapp_opened_at' => now(),
        ]);
    }

    public function getOrders(array $filters)
    {
        $query = Order::query();
        $query->when($filters['q'] ?? null, function ($q, $search) {
            $q->whereAny(['customer_name', 'phone', 'order_number'], 'like', '%'. $search .'%');
        })->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        })->when($filters['payment_status'] ?? null, function ($q, $payment_status) {
            $q->where('payment_status', $payment_status);
        })->when($filters['city'] ?? null, function ($q, $city) {
            $q->where('city', 'like', '%'. $city .'%');
        })->when($filters['date_from'] ?? null, function ($q, $from) {
            $q->whereDate('created_at', '>=', $from);
        })->when($filters['date_to'] ?? null, function ($q, $to) {
            $q->whereDate('created_at', '<=', $to);
        })->when($filters['older_than_hours'] ?? null, function ($q, $hours) {
            // e.g. pending orders older than 24h whose customer never sent the whatsapp message
            $q->where('created_at', '<=', now()->subHours($hours));
        });

        match ($filters['sort'] ?? null) {
            'oldest' => $query->oldest(),
            'total_desc' => $query->orderByDesc('total'),
            'total_asc' => $query->orderBy('total'),
            default => $query->latest(),
        };

        return $query->with('items')->withCount('items')->paginate(10);
    }

    public function getOrder(Order $order)
    {
        return $order->load(['history.user', 'items'])->loadCount('items');
    }

    // cancel pending orders older than $olderThanHours and give their stock back
    public function cancelUnpaidOrders(int $olderThanHours, bool $onlyUnopened = false): int
    {
        $note = $onlyUnopened
            ? "Auto-cancelled: WhatsApp not opened within {$olderThanHours}h."
            : "Auto-cancelled: not confirmed within {$olderThanHours}h.";

        $orderIds = $this->unpaidOrdersQuery($olderThanHours, $onlyUnopened)->pluck('id');

        // one transaction per order, so a failure on one doesn't undo the others
        return $orderIds->filter(fn($id) => $this->cancelUnpaidOrder($id, $olderThanHours, $onlyUnopened, $note))->count();
    }

    private function unpaidOrdersQuery(int $olderThanHours, bool $onlyUnopened)
    {
        return Order::where('status', 'pending')
            ->where('created_at', '<=', now()->subHours($olderThanHours))
            ->when($onlyUnopened, fn($q) => $q->whereNull('whatsapp_opened_at'));
    }

    private function cancelUnpaidOrder(int $orderId, int $olderThanHours, bool $onlyUnopened, string $note): bool
    {
        return DB::transaction(function () use ($orderId, $olderThanHours, $onlyUnopened, $note) {
            // re-check the conditions in the update itself: if the admin confirmed the order
            // (or the customer opened whatsapp) in the meantime, nothing is updated and the stock stays
            $cancelled = $this->unpaidOrdersQuery($olderThanHours, $onlyUnopened)
                ->where('id', $orderId)
                ->update(['status' => 'cancelled']);

            if (! $cancelled) {
                return false;
            }

            $order = Order::with('items')->find($orderId);

            $this->restoreStock($order);

            $order->history()->create([
                'user_id' => null, // done by the system, not an admin
                'from_status' => 'pending',
                'to_status' => 'cancelled',
                'note' => $note,
            ]);

            Log::channel('orders')->info("Order auto-cancelled", [
                'order_number' => $order->order_number,
                'reason' => $note,
                'items' => $order->items->count(),
            ]);

            return true;
        });
    }

    public function changeStatus(Order $order, string $to, ?User $user, ?string $note)
    {
        return DB::transaction(function () use ($order, $to, $user, $note) {
            // re-read the order under the lock so we check the real current status,
            // not the one loaded by route binding (another admin may have changed it)
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $from = $order->status;

            if (! $order->canTransitionTo($to)) abort(422, "Cannot change order status from {$from} to {$to}.");

            // restore the stock if the order is cancelled
            if ($to === 'cancelled') {
                $this->restoreStock($order->load('items'));
            }

            // save the new status
            $order->update(['status' => $to]);

            $order->history()->create([
                'user_id' => $user?->id,
                'from_status' => $from,
                'to_status' => $to,
                'note' => $note
            ]);

            Log::channel('orders')->info('Status Changed:', [
                'order_number' => $order->order_number,
                'from_status' => $from,
                'to_status' => $to,
                'by' => $user?->name ?? 'system'
            ]);

            return $order;
        });
    }

    // give back the stock of every item of the order (items must be loaded)
    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            // product_id is null when the product was deleted, nothing to give back
            if ($item->product_id) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }
    }
}
