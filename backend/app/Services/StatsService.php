<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\Concerns\HandlesCache;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Log;
use Throwable;

class StatsService
{
    use HandlesCache;

    private const CACHE_SECONDS = 300;
    private const LOW_STOCK_LIMIT = 5;

    public function dashboard(): array
    {
        return [
            'revenue_this_month' => $this->piece('revenue_this_month', fn() => $this->getMonthRevenue()),
            'orders_by_status' => $this->piece('orders_by_status', fn() => $this->getOrdersByStatus()),
            'revenue_last_30_days' => $this->piece('revenue_last_30_days', fn() => $this->getRevenuePerDay()),
            'top_products' => $this->piece('top_products', fn() => $this->getTopProducts()),
            'low_stock' => $this->piece('low_stock', fn() => $this->getLowStock()),
            'pending_over_24h' => $this->piece('pending_over_24h', fn() => $this->getPendingOver24h()),
        ];
    }

    // a failing piece comes back as null and is not cached: the others still show,
    // and the failed one is tried again on the next request
    private function piece(string $key, callable $fn)
    {
        try {
            return $this->cached("stats.{$key}", self::CACHE_SECONDS, $fn);
        } catch (Throwable $e) {
            Log::error("Stats piece failed: {$key}", ['exception' => $e]);
            return null;
        }
    }

    public function getMonthRevenue(): float
    {
        return (float) Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total');
    }

    public function getOrdersByStatus(): array
    {
        $counts = Order::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // statuses with no orders come back as 0 instead of missing
        return collect(array_keys(Order::TRANSITIONS))
            ->mapWithKeys(fn($status) => [$status => (int) ($counts[$status] ?? 0)])
            ->all();
    }

    public function getRevenuePerDay(): array
    {
        $from = now()->subDays(29)->startOfDay(); // today + the 29 days before = 30 days

        $totals = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as day, SUM(total) as revenue')
            ->groupBy('day')
            ->pluck('revenue', 'day');

        // days without paid orders are missing from the query, fill them with 0
        return collect(CarbonPeriod::create($from, now()->startOfDay()))
            ->map(fn(CarbonInterface $date) => [
                'date' => $date->toDateString(),
                'revenue' => (float) ($totals[$date->toDateString()] ?? 0),
            ])
            ->all();
    }

    public function getTopProducts(int $limit = 5): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
            ->whereNotNull('order_items.product_id') // deleted products can't be shown
            ->selectRaw('order_items.product_id, SUM(order_items.quantity) as sold, SUM(order_items.line_total) as revenue')
            ->groupBy('order_items.product_id')
            ->orderByDesc('sold')
            ->limit($limit)
            ->with('product:id,name,slug,stock')
            ->get()
            ->map(fn($item) => [
                'product_id' => $item->product_id,
                'name' => $item->product?->name,
                'slug' => $item->product?->slug,
                'stock' => $item->product?->stock,
                'sold' => (int) $item->sold,
                'revenue' => (float) $item->revenue,
            ])
            ->all();
    }

    public function getLowStock(): array
    {
        return Product::where('stock', '<', self::LOW_STOCK_LIMIT)
            ->orderBy('stock')
            ->get(['id', 'name', 'slug', 'stock', 'is_active'])
            ->toArray();
    }

    // pending orders waiting more than a day: the customers to phone
    public function getPendingOver24h(): array
    {
        return Order::where('status', 'pending')
            ->where('created_at', '<=', now()->subHours(24))
            ->oldest()
            ->get(['id', 'order_number', 'customer_name', 'phone', 'city', 'total', 'created_at'])
            ->toArray();
    }
}
