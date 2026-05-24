<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_drivers', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code', 50)->nullable()->unique();
            $table->string('name', 150);
            $table->string('phone', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('license_number', 100)->nullable();
            $table->string('license_type', 30)->nullable(); // SIM A, SIM B1, SIM B2
            $table->date('license_expiry')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'On Leave'])->default('Active');
            $table->string('photo_url', 500)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status']);
            $table->index(['license_expiry']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_drivers');
    }
};
