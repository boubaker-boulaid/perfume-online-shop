<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OfferController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\StatsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('me', function (Request $request) {
    return $request->user();
});

Route::apiResource('products', ProductController::class)->parameters([
    'products' => 'product:slug',
]);

Route::apiResource('categories', CategoryController::class)->parameters([
    'categories' => 'category:slug',
]);

Route::apiResource('offers', OfferController::class)->parameters([
    'offers' => 'offer:slug'
]);

Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
Route::get('orders/{order:order_number}', [OrderController::class, 'show'])->name('orders.show');
Route::patch('orders/{order:order_number}/status', [OrderController::class, 'status'])->name('orders.status');

Route::get('stats', [StatsController::class, 'index'])->name('stats');
