<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_task_templates', function (Blueprint $table) {
            $table->id('id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->enum('category', ['daily', 'weekly', 'monthly']);
            $table->enum('priority', ['low', 'normal', 'high', 'emergency'])->default('normal');
            $table->integer('estimated_duration_minutes')->nullable();
            $table->boolean('requires_photo')->default(0);
            $table->boolean('requires_gps')->default(0);
            $table->text('checklist_items')->nullable();
            $table->string('tags', 500)->nullable();
            $table->boolean('is_active')->default(1);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->index(['category']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_task_templates');
    }
};
