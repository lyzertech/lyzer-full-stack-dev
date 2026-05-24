<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('vendor_code', 50)->nullable()->unique();
            $table->string('workshop_name', 200);
            $table->string('contact_person', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->enum('vendor_type', ['Internal Workshop', 'External Workshop', 'Dealer', 'Specialist'])->default('External Workshop');
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5
            $table->text('service_notes')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_vendors');
    }
};
