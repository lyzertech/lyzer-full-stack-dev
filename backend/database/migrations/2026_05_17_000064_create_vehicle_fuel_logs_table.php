<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->date('fuel_date');
            $table->decimal('odometer', 12, 1);
            $table->decimal('liters', 8, 2);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->string('fuel_type', 50)->nullable(); // Pertalite, Pertamax, Solar, etc.
            $table->string('fuel_station', 200)->nullable();
            $table->decimal('km_per_liter', 8, 2)->nullable(); // calculated
            $table->decimal('previous_odometer', 12, 1)->nullable();
            $table->decimal('distance_since_last', 10, 1)->nullable();
            $table->boolean('full_tank')->default(1);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable(); // auth_users.id
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->index(['vehicle_id']);
            $table->index(['fuel_date']);
            $table->index(['driver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_fuel_logs');
    }
};
