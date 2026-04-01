<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_tasks', function (Blueprint $table) {
            $table->id('id');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('category', ['daily', 'weekly', 'monthly']);
            $table->enum('priority', ['low', 'normal', 'high', 'emergency']);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'overdue', 'cancelled']);
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('asset_id')->nullable();
            $table->date('due_date')->nullable();
            $table->string('recurrence_pattern', 100)->nullable();
            $table->unsignedBigInteger('parent_task_id')->nullable();
            $table->string('tags', 500)->nullable();
            $table->boolean('requires_photo')->default(0);
            $table->boolean('requires_gps')->default(0);
            $table->integer('estimated_duration_minutes')->nullable();
            $table->integer('actual_duration_minutes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['category']);
            $table->index(['status']);
            $table->index(['priority']);
            $table->index(['assigned_to']);
            $table->index(['created_by']);
            $table->index(['asset_id']);
            $table->index(['due_date']);
            $table->index(['parent_task_id']);
            $table->index(['created_at']);
            $table->index(['status', 'category']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_tasks');
    }
};
