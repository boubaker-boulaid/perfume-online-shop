<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('products', [ProductController::class, 'active'])->name('products.index');
Route::get('products/featured', [ProductController::class, 'featured'])->name('products.featured');
Route::get('products/{slug}', [ProductController::class, 'showActive'])->name('products.show');
Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
Route::patch('orders/{orderNumber}/whatsapp-opened', [OrderController::class, 'whatsappOpened'])->middleware('signed')->name('orders.whatsapp-opened');
