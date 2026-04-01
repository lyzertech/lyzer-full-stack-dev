<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_role_permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('role_id');
            $table->unsignedInteger('permission_id');
            $table->timestamps();
            $table->index(['role_id']);
            $table->index(['permission_id']);
            $table->unique(['role_id', 'permission_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_role_permissions');
    }
};
