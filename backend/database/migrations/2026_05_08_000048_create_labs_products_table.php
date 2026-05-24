<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('labs_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('product_name', 255);
            $table->string('model', 100)->nullable();
            $table->string('sku', 100)->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('image', 500)->nullable()->comment('Primary product image path/URL');
            $table->string('datasheet', 500)->nullable()->comment('PDF datasheet path/URL');
            $table->json('specs_cache')->nullable()->comment('Denormalized snapshot of all spec values for fast frontend reads');
            $table->enum('status', ['Active', 'Discontinued', 'Draft'])->default('Active');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('brand_id')->references('id')->on('labs_brands')->nullOnDelete();
            $table->foreign('category_id')->references('id')->on('labs_categories')->nullOnDelete();

            $table->index(['brand_id']);
            $table->index(['category_id']);
            $table->index(['status']);
            $table->index(['sku']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labs_products');
    }
};
