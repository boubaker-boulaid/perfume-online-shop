<?php

use Illuminate\Support\Facades\Route;

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
    // customers public routes
    Route::prefix('/')->group(base_path('routes/customer.php'));

    // admin routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(base_path('routes/admin.php'));
});
