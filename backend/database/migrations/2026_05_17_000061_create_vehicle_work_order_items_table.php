<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_work_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('work_order_id');
            $table->unsignedBigInteger('sparepart_id')->nullable();
            $table->string('item_name', 200);
            $table->string('item_type', 50)->default('sparepart'); // sparepart, labor, other
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit', 20)->default('pcs');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('work_order_id')->references('id')->on('vehicle_work_orders')->cascadeOnDelete();
            $table->foreign('sparepart_id')->references('id')->on('vehicle_spareparts')->nullOnDelete();
            $table->index(['work_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_work_order_items');
    }
};
