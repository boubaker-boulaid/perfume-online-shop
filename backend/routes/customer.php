<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OfferController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('categories', [CategoryController::class, 'active'])->name('categories.index');
Route::get('products', [ProductController::class, 'active'])->name('products.index');
Route::get('products/featured', [ProductController::class, 'featured'])->name('products.featured');
Route::get('products/{slug}', [ProductController::class, 'showActive'])->name('products.show');
Route::get('offers', [OfferController::class, 'active'])->name('offers.index');
Route::get('offers/{slug}', [OfferController::class, 'showActive'])->name('offers.show');

Route::middleware('throttle:orders')->group(function () {
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::patch('orders/{orderKey}/whatsapp-opened', [OrderController::class, 'whatsappOpened'])->middleware('signed')->name('orders.whatsapp-opened');
    Route::get('orders/{orderKey}/whatsapp', [OrderController::class, 'whatsappRedirect'])->middleware('signed')->name('orders.whatsapp-redirect');
});
