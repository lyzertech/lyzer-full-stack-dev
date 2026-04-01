<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(0);
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['slug']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_roles');
    }
};
