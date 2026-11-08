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
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            // the set stored in the products table (one set belongs to one offer)
            $table->foreignId('product_id')->unique()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique(); // the set's slug: the cart links back with it
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('image_path');
            $table->json('terms')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['is_active', 'starts_at', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
