<?php

namespace App\Exceptions;

use App\ApiResponseTrait;
use Exception;
use Illuminate\Http\Request;

class InsufficientStockException extends Exception
{
    use ApiResponseTrait;

    // kept as properties so the order log can record them as searchable fields
    public function __construct(
        public readonly string $productName,
        public readonly int $stockRequested,
        public readonly int $stockAvaliable,
    ) {
        parent::__construct("Stock insuffisant pour {$productName}. Quantité demandée : {$stockRequested}, quantité disponible : {$stockAvaliable}.");
    }

    public function render(Request $request)
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return $this->fail($this->getMessage(), 400, null);
        }
    }
}
