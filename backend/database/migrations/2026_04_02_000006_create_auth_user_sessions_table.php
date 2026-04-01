<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_user_sessions', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->string('session_token', 255)->unique();
            $table->string('refresh_token', 255)->nullable()->unique();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('device_type', 50)->nullable();
            $table->string('device_id', 255)->nullable();
            $table->string('location', 255)->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamp('expires_at');
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['session_token']);
            $table->index(['refresh_token']);
            $table->index(['is_active']);
            $table->index(['expires_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_user_sessions');
    }
};
