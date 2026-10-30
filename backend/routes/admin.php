<?php

use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('me', function (Request $request) {
    return $request->user();
});

Route::apiResource('products', ProductController::class);