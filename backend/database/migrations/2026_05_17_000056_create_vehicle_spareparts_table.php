<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_spareparts', function (Blueprint $table) {
            $table->id();
            $table->string('sparepart_code', 50)->unique();
            $table->string('name', 200);
            $table->string('category', 100)->nullable(); // Engine Oil, Oil Filter, Air Filter, etc.
            $table->string('brand', 100)->nullable();
            $table->string('part_number', 100)->nullable();
            $table->string('unit', 20)->default('pcs'); // pcs, liter, set, meter
            $table->decimal('stock_quantity', 10, 2)->default(0);
            $table->decimal('minimum_stock', 10, 2)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->string('supplier', 200)->nullable();
            $table->string('supplier_phone', 30)->nullable();
            $table->unsignedInteger('replacement_interval_km')->nullable();
            $table->unsignedInteger('replacement_interval_days')->nullable();
            $table->unsignedInteger('replacement_interval_hours')->nullable();
            $table->text('compatible_vehicle_types')->nullable(); // JSON array of vehicle_type_ids
            $table->string('location', 100)->nullable(); // Storage location/rack
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category']);
            $table->index(['stock_quantity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_spareparts');
    }
};
