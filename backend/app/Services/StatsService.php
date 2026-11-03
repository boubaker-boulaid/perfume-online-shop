<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use Date;
use DateTime;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StatsService
{
    private const CACHE_SECONDS = 300;
    private const LOW_STOCK_LIMIT = 5;

    public function dashboard(): array
    {
        return [
            'revenue_this_month' => $this->cached('revenue_this_month', fn() => $this->getMonthRevenue()),
            'orders_by_status' => $this->cached('orders_by_status', fn() => $this->getOrdersByStatus()),
            'revenue_last_30_days' => $this->cached('revenue_last_30_days', fn() => $this->getRevenuePerDay()),
            'top_products' => $this->cached('top_products', fn() => $this->getTopProducts()),
            'low_stock' => $this->cached('low_stock', fn() => $this->getLowStock()),
            'pending_over_24h' => $this->cached('pending_over_24h', fn() => $this->getPendingOver24h()),
        ];
    }

    // each piece is cached on its own: if one fails it comes back as null and is not cached,
    // so the others still show and the failed one is retried on the next request
    private function cached(string $key, callable $fn)
    {
        try {
            return Cache::remember("stats.{$key}", self::CACHE_SECONDS, $fn);
        } catch (\Throwable $e) {
            Log::error("Stats piece failed: {$key}", ['error' => $e->getMessage()]);
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
            ->where('created_at', '<=', now()->subHours(23))
            ->oldest()
            ->get(['id', 'order_number', 'customer_name', 'phone', 'city', 'total', 'created_at'])
            ->toArray();
    }
}
