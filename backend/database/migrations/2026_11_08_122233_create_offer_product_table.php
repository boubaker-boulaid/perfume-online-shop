<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('offer_product', function (Blueprint $table) {
            $table->id();
            // deleting an offer deletes its rows from this pivot table
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            // deleting a product thats inside an offer is restricted 
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->boolean('is_free')->default(false);
            $table->unique(['offer_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offer_product');
    }
};
