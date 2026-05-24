<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_attachments', function (Blueprint $table) {
            $table->id();
            $table->string('attachable_type', 100); // Vehicle, WorkOrder, InspectionChecklist
            $table->unsignedBigInteger('attachable_id');
            $table->string('file_name', 255);
            $table->string('file_url', 500);
            $table->string('file_type', 50)->nullable(); // image, pdf, document
            $table->unsignedInteger('file_size')->nullable(); // bytes
            $table->string('category', 100)->nullable(); // photo, document, before, after
            $table->text('description')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable(); // auth_users.id
            $table->timestamps();

            $table->index(['attachable_type', 'attachable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_attachments');
    }
};
