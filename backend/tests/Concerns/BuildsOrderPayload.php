<?php

namespace Tests\Concerns;

use Illuminate\Support\Str;

trait BuildsOrderPayload
{
    private function orderPayload(array $items, array $extra = []): array
    {
        return [
            'customer_name' => 'Test Customer',
            'phone' => '+212600000000',
            'email' => 'customer@example.com',
            'city' => 'Agadir',
            'address' => '1 Test Street',
            'idempotency_key' => (string) Str::uuid(),
            'items' => $items,
            ...$extra,
        ];
    }
}
