<?php

use App\Http\Controllers\Api\V1\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
});