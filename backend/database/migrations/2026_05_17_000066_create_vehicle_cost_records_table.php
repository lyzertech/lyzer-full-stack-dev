<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_cost_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('work_order_id')->nullable();
            $table->date('cost_date');
            $table->enum('cost_type', ['Maintenance', 'Fuel', 'Sparepart', 'Tire', 'Insurance', 'Tax', 'Other'])->default('Maintenance');
            $table->decimal('amount', 15, 2);
            $table->string('description', 300)->nullable();
            $table->string('vendor', 200)->nullable();
            $table->string('reference', 100)->nullable(); // invoice number
            $table->unsignedBigInteger('recorded_by')->nullable(); // auth_users.id
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->index(['vehicle_id']);
            $table->index(['cost_type']);
            $table->index(['cost_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_cost_records');
    }
};
