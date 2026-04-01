<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_user_roles', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('role_id');
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->timestamp('assigned_at')->default(now());
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['role_id']);
            $table->index(['is_active']);
            $table->index(['expires_at']);
            $table->unique(['user_id', 'role_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_user_roles');
    }
};
