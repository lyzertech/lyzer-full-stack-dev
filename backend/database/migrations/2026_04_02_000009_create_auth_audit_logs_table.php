<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_audit_logs', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 100);
            $table->string('resource', 100)->nullable();
            $table->string('resource_id', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->text('metadata')->nullable();
            $table->enum('severity', ['Info', 'Warning', 'Error', 'Critical'])->default('Info');
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['action']);
            $table->index(['resource']);
            $table->index(['severity']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_audit_logs');
    }
};
