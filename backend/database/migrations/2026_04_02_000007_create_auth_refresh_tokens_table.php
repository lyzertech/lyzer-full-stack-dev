<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_refresh_tokens', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->string('token', 255)->unique();
            $table->timestamp('expires_at');
            $table->boolean('is_revoked')->default(0);
            $table->timestamp('revoked_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['token']);
            $table->index(['expires_at']);
            $table->index(['is_revoked']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_refresh_tokens');
    }
};
