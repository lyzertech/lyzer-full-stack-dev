<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_products', function (Blueprint $table) {
            $table->id('id');

            // Product identity
            $table->string('sku', 100)->unique();
            $table->string('brand', 255)->nullable();
            $table->string('name', 255);
            $table->string('code', 100)->unique();
            $table->string('model', 255)->nullable();
            $table->string('type', 100)->nullable();
            $table->string('unit', 50)->nullable();

            $table->text('description')->nullable();

            // Pricing
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);

            // Inventory
            $table->integer('stock_qty')->default(0);
            $table->boolean('track_stock')->default(true);
            $table->boolean('is_active')->default(true);

            // Audit
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['sku']);
            $table->index(['code']);
            $table->index(['brand']);
            $table->index(['name']);
            $table->index(['type']);
            $table->index(['is_active']);
            $table->index(['created_at']);
            $table->index(['deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_products');
    }
};
