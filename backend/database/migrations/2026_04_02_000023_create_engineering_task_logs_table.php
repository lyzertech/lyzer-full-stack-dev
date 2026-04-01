<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_task_logs', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('action_type', ['created', 'updated', 'completed', 'comment', 'status_change', 'photo_upload', 'gps_capture']);
            $table->enum('old_status', ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'])->nullable();
            $table->enum('new_status', ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'])->nullable();
            $table->text('update_details')->nullable();
            $table->text('comment')->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->string('location_tag', 255)->nullable();
            $table->string('location_address', 500)->nullable();
            $table->text('metadata')->nullable();
            $table->timestamps();
            $table->index(['task_id']);
            $table->index(['user_id']);
            $table->index(['action_type']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_task_logs');
    }
};
