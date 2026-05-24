<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_inspection_checklists', function (Blueprint $table) {
            $table->id();
            $table->string('checklist_number', 50)->unique();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->unsignedBigInteger('inspector_id')->nullable(); // auth_users.id
            $table->date('inspection_date');
            $table->enum('inspection_type', ['Pre-Trip', 'Post-Trip', 'Daily', 'Weekly', 'Monthly', 'Periodic'])->default('Daily');
            $table->decimal('odometer', 12, 1)->nullable();
            $table->enum('overall_status', ['Good', 'Warning', 'Critical'])->default('Good');
            $table->unsignedTinyInteger('health_score')->default(100); // 0-100
            $table->text('general_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->index(['vehicle_id']);
            $table->index(['inspection_date']);
            $table->index(['overall_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspection_checklists');
    }
};
