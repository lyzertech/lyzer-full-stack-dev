<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('resource', 100);
            $table->string('action', 50);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['slug']);
            $table->index(['resource']);
            $table->index(['action']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_permissions');
    }
};
