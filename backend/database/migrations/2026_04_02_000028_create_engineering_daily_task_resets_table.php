<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_daily_task_resets', function (Blueprint $table) {
            $table->id('id');
            $table->date('reset_date')->unique();
            $table->integer('tasks_reset_count')->default(0);
            $table->timestamp('executed_at')->default(now());
            $table->enum('status', ['success', 'partial', 'failed'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index(['executed_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_daily_task_resets');
    }
};
