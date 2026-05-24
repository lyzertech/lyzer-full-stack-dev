<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_service_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('vehicle_type_id')->nullable();
            $table->string('service_name', 200);
            $table->text('description')->nullable();
            $table->enum('trigger_type', ['mileage', 'time', 'hours', 'mileage_and_time'])->default('mileage');
            $table->unsignedInteger('interval_km')->nullable();
            $table->unsignedInteger('interval_days')->nullable();
            $table->unsignedInteger('interval_hours')->nullable();
            $table->decimal('last_service_odometer', 12, 1)->nullable();
            $table->date('last_service_date')->nullable();
            $table->decimal('last_service_hours', 10, 1)->nullable();
            $table->decimal('next_due_odometer', 12, 1)->nullable();
            $table->date('next_due_date')->nullable();
            $table->decimal('next_due_hours', 10, 1)->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->index(['vehicle_id']);
            $table->index(['next_due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_service_schedules');
    }
};
