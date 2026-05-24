<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_code', 50)->unique();
            $table->string('plate_number', 30)->nullable();
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('vin_number', 100)->nullable()->unique();
            $table->string('engine_number', 100)->nullable();
            $table->unsignedBigInteger('vehicle_type_id')->nullable();
            $table->enum('fuel_type', ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Other'])->default('Diesel');
            $table->enum('transmission', ['Manual', 'Automatic', 'CVT', 'Semi-Auto'])->nullable();
            $table->decimal('odometer', 12, 1)->default(0); // in km or hours
            $table->string('odometer_unit', 10)->default('km'); // km or hours
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->string('insurance_number', 100)->nullable();
            $table->date('registration_expiry')->nullable();
            $table->string('registration_number', 100)->nullable();
            $table->unsignedBigInteger('assigned_driver_id')->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->enum('status', ['Active', 'Maintenance', 'Breakdown', 'Retired'])->default('Active');
            $table->string('location', 200)->nullable();
            $table->string('department', 100)->nullable();
            $table->text('notes')->nullable();
            $table->string('qr_code', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehicle_type_id')->references('id')->on('vehicle_types')->nullOnDelete();
            $table->foreign('assigned_driver_id')->references('id')->on('vehicle_drivers')->nullOnDelete();

            $table->index(['status']);
            $table->index(['vehicle_type_id']);
            $table->index(['assigned_driver_id']);
            $table->index(['insurance_expiry']);
            $table->index(['registration_expiry']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
