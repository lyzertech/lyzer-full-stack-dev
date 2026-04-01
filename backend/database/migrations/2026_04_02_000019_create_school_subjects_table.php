<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_subjects', function (Blueprint $table) {
            $table->id('id');
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->integer('grade');
            $table->integer('semester');
            $table->enum('type', ['mandatory', 'elective'])->default('mandatory');
            $table->integer('hours_per_week')->default(0);
            $table->boolean('is_active')->default(1);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_subjects');
    }
};
