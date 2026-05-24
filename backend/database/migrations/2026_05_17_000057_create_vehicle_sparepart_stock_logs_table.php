<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_sparepart_stock_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sparepart_id');
            $table->enum('type', ['In', 'Out', 'Adjustment'])->default('In');
            $table->decimal('quantity', 10, 2);
            $table->decimal('quantity_before', 10, 2);
            $table->decimal('quantity_after', 10, 2);
            $table->decimal('unit_price', 15, 2)->nullable();
            $table->unsignedBigInteger('work_order_id')->nullable();
            $table->string('reference', 100)->nullable(); // PO number, WO number
            $table->string('supplier', 200)->nullable();
            $table->date('transaction_date');
            $table->unsignedBigInteger('recorded_by')->nullable(); // auth_users.id
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('sparepart_id')->references('id')->on('vehicle_spareparts')->cascadeOnDelete();
            $table->index(['sparepart_id']);
            $table->index(['type']);
            $table->index(['transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_sparepart_stock_logs');
    }
};
