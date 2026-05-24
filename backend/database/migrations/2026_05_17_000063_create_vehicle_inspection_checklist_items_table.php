<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_inspection_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('checklist_id');
            $table->string('check_item', 200); // Tire, Brake, Engine Oil, etc.
            $table->string('category', 100)->nullable(); // Mechanical, Electrical, Safety
            $table->enum('result', ['Good', 'Warning', 'Critical', 'Not Checked'])->default('Not Checked');
            $table->text('technician_notes')->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->timestamps();

            $table->foreign('checklist_id')->references('id')->on('vehicle_inspection_checklists')->cascadeOnDelete();
            $table->index(['checklist_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspection_checklist_items');
    }
};
