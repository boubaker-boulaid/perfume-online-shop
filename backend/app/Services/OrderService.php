<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Jobs\SendOrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
                    'note' => $data['note'],
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
        } catch (\Exception $e) {
            Log::channel('daily')->error("Failed to place order: {$e->getMessage()}", [
                'payload' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function lockAndValidateProduct(array $items)
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
        }

        return $products;
    }

    public function generateOrderNumber()
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

    public function saveOrderItems(Order $order, Collection $products, array $items)
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
}
