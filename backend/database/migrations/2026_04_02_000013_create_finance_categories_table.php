<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('finance_categories', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255);
            $table->enum('type', ['Income', 'Expense']);
            $table->unsignedInteger('parent_id')->nullable();
            $table->text('description')->nullable();
            $table->string('color', 7)->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['type']);
            $table->index(['parent_id']);
            $table->index(['is_active']);
            $table->unique(['name', 'type']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('finance_categories');
    }
};
