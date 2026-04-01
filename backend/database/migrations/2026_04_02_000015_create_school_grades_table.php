<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_grades', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->integer('level');
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
            $table->unique(['name', 'level']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_grades');
    }
};
