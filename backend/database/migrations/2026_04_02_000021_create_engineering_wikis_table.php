<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_wikis', function (Blueprint $table) {
            $table->id('id');
            $table->string('title', 255);
            $table->string('customer_name', 255)->nullable();
            $table->enum('category', ['issue', 'update', 'note'])->default('note');
            $table->string('brand', 255)->nullable();
            $table->string('device_type', 255)->nullable();
            $table->string('model', 255)->nullable();
            $table->string('serial_number', 255)->nullable();
            $table->string('firmware_version', 255)->nullable();
            $table->string('hardware_version', 255)->nullable();
            $table->text('symptom')->nullable();
            $table->string('symptom_file', 500)->nullable();
            $table->string('symptom_image', 500)->nullable();
            $table->text('root_cause')->nullable();
            $table->string('root_cause_file', 500)->nullable();
            $table->string('root_cause_image', 500)->nullable();
            $table->text('solution')->nullable();
            $table->string('solution_file', 500)->nullable();
            $table->string('solution_image', 500)->nullable();
            $table->text('action_taken')->nullable();
            $table->string('action_taken_file', 500)->nullable();
            $table->string('action_taken_image', 500)->nullable();
            $table->enum('status', ['open', 'monitoring', 'solved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('reference_doc', 255)->nullable();
            $table->timestamps();
            $table->index(['category']);
            $table->index(['status']);
            $table->index(['priority']);
            $table->index(['brand']);
            $table->index(['device_type']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_wikis');
    }
};
