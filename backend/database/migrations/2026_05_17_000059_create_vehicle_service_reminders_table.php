<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_service_reminders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('service_schedule_id')->nullable();
            $table->string('reminder_type', 100); // oil_change, brake_pad, insurance, registration, etc.
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->decimal('due_odometer', 12, 1)->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('due_hours', 10, 1)->nullable();
            $table->enum('status', ['upcoming', 'due_today', 'overdue', 'completed', 'dismissed'])->default('upcoming');
            $table->unsignedInteger('advance_notice_days')->default(7);
            $table->unsignedInteger('advance_notice_km')->default(500);
            $table->boolean('notification_sent')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('completed_work_order_id')->nullable();
            $table->timestamps();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->index(['vehicle_id']);
            $table->index(['status']);
            $table->index(['due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_service_reminders');
    }
};
