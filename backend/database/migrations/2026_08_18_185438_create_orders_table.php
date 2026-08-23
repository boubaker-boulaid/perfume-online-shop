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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('idempotency_key')->unique(); //stops the same order being saved twice 
            $table->string('customer_name');
            $table->string('phone');
            $table->string('email')->nullable(); //used to send the confirmation
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->text('note')->nullable(); // anything the customer wants to add 
            $table->decimal('subtotal',10,2);
            $table->decimal('shipping_cost',10,2)->default(0);
            $table->dateTime('confirmation_sent_at')->nullable(); //prevent the confirmation email being sent twice 
            $table->decimal('total',10,2); //subtotal + shipping_cost
            $table->string('status')->index();
            $table->string('payment_status');
            $table->dateTime('whatsapp_opened_at')->nullable();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
