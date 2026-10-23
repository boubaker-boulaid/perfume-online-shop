<?php

namespace App\Exceptions;

use App\ApiResponseTrait;
use Exception;
use Illuminate\Http\Request;

class InsufficientStockException extends Exception
{
    use ApiResponseTrait;

    public function __construct(string $productName, int $stockRequested, int $stockAvaliable)
    {
        return parent::__construct("Insufficient stock for {$productName}. Stock requested: {$stockRequested}, Stock avaliable: {$stockAvaliable}.");
    }

    public function render(Request $request)
    {
        if ($request->expectsJson()) {
            return $this->fail($this->getMessage(), 400, null);
        }
    }
}
