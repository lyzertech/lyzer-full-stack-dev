<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_facilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id');
            $table->string('name', 255);
            $table->string('code', 100)->unique()->comment('Unique facility code, e.g. FAC-ALPHA');
            $table->string('location_name', 255)->nullable()->comment('General location e.g. Rayong, Thailand');
            $table->text('full_address')->nullable();
            $table->string('facility_type', 100)->nullable()->comment('Manufacturing, Logistics, Office, etc.');
            $table->string('manager_name', 255)->nullable();
            $table->string('manager_email', 255)->nullable();
            $table->string('manager_phone', 50)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('status', ['Online', 'Offline', 'Maintenance', 'Commissioning'])->default('Commissioning');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('organization_id')->references('id')->on('monitoring_organizations')->onDelete('cascade');
            $table->index(['status']);
            $table->index(['facility_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_facilities');
    }
};
