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
        // 1. Categories
        Schema::create('pointplus_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 2. Suppliers
        Schema::create('pointplus_suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_name');
            $table->string('company')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Units
        Schema::create('pointplus_units', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // PCS, PACK, BOX, CARTON
            $table->string('symbol')->nullable();
            $table->timestamps();
        });

        // 4. Products
        Schema::create('pointplus_products', function (Blueprint $table) {
            $table->id();
            $table->string('barcode')->unique();
            $table->string('sku')->nullable();
            $table->string('product_name');
            $table->foreignId('category_id')->nullable()->constrained('pointplus_categories')->nullOnDelete();
            $table->string('brand')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('pointplus_suppliers')->nullOnDelete();
            $table->string('unit')->default('PCS');
            $table->decimal('purchase_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        // 5. Product Units (For Multi Unit Conversion)
        Schema::create('pointplus_product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pointplus_products')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('pointplus_units')->cascadeOnDelete();
            $table->integer('conversion_factor'); // e.g., 24 for 1 carton = 24 pcs
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->decimal('selling_price', 15, 2)->nullable();
            $table->timestamps();
        });

        // 6. Transactions (Sales)
        Schema::create('pointplus_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->string('payment_method'); // Cash, QRIS, Transfer, Debit/Credit
            $table->decimal('amount_paid', 15, 2);
            $table->decimal('change', 15, 2)->default(0);
            $table->string('status')->default('completed'); // completed, refunded
            $table->foreignId('cashier_id')->nullable(); // Assuming standard users table or modify as needed
            $table->timestamps();
        });

        // 7. Transaction Items
        Schema::create('pointplus_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('pointplus_transactions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('pointplus_products');
            $table->integer('quantity');
            $table->decimal('price', 15, 2); // Price at time of sale
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });

        // 8. Stock Movements
        Schema::create('pointplus_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pointplus_products')->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']); // in, out, adjustment
            $table->integer('quantity');
            $table->string('reference_type')->nullable(); // Sale, Purchase, Return, Adjustment, Damaged, Expired
            $table->string('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 9. Purchases
        Schema::create('pointplus_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('pointplus_suppliers');
            $table->string('invoice_number')->nullable();
            $table->date('purchase_date');
            $table->decimal('total', 15, 2);
            $table->string('status')->default('completed'); // pending, completed
            $table->timestamps();
        });

        // 10. Purchase Items
        Schema::create('pointplus_purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('pointplus_purchases')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('pointplus_products');
            $table->integer('quantity');
            $table->decimal('price', 15, 2); // Purchase price at time of purchase
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointplus_purchase_items');
        Schema::dropIfExists('pointplus_purchases');
        Schema::dropIfExists('pointplus_stock_movements');
        Schema::dropIfExists('pointplus_transaction_items');
        Schema::dropIfExists('pointplus_transactions');
        Schema::dropIfExists('pointplus_product_units');
        Schema::dropIfExists('pointplus_products');
        Schema::dropIfExists('pointplus_units');
        Schema::dropIfExists('pointplus_suppliers');
        Schema::dropIfExists('pointplus_categories');
    }
};
