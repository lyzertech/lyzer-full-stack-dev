<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_task_comments', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('comment');
            $table->boolean('is_internal')->default(0);
            $table->timestamps();
            $table->index(['task_id']);
            $table->index(['user_id']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_task_comments');
    }
};
