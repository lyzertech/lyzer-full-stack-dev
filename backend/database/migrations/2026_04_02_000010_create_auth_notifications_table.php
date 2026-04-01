<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_notifications', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['Info', 'Success', 'Warning', 'Error', 'System', 'Security']);
            $table->string('title', 255);
            $table->text('message');
            $table->string('link', 500)->nullable();
            $table->boolean('is_read')->default(0);
            $table->timestamp('read_at')->nullable();
            $table->text('metadata')->nullable();
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['type']);
            $table->index(['is_read']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_notifications');
    }
};
