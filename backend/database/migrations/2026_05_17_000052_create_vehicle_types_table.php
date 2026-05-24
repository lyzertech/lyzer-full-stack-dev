<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('category', 100)->nullable(); // e.g. Car, Truck, Generator, Excavator
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->unsignedInteger('default_oil_interval_km')->nullable();
            $table->unsignedInteger('default_oil_interval_days')->nullable();
            $table->unsignedInteger('default_service_interval_km')->nullable();
            $table->unsignedInteger('default_service_interval_days')->nullable();
            $table->unsignedInteger('default_service_interval_hours')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_types');
    }
};
