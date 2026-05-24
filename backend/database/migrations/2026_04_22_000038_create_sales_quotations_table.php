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
        Schema::create('sales_quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_no', 100)->unique();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('customer_name', 255)->nullable();
            $table->string('customer_company', 255)->nullable();
            $table->string('customer_email', 255)->nullable();
            $table->string('sales_owner', 255)->nullable();
            $table->string('status', 50)->default('Draft');
            $table->string('validity_days', 10)->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('subject', 255)->nullable();
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->decimal('tax_pct', 5, 2)->default(11);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sales_quotation_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quotation_id');
            $table->string('product_sku', 100);
            $table->string('product_name', 255);
            $table->string('unit', 50)->nullable();
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('discount_pct', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('quotation_id')->references('id')->on('sales_quotations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_quotation_items');
        Schema::dropIfExists('sales_quotations');
    }
};
