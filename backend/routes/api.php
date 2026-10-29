<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// api status/health check
Route::get('/status', function () {
    return response()->json([
        'success' => true,
        'message' => 'Shop API is running',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ], 200);
});

Route::prefix('v1')->group(function () {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/featured', [ProductController::class, 'featured']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::patch('orders/{orderNumber}/whatsapp-opened', [OrderController::class, 'whatsappOpened']);
});
