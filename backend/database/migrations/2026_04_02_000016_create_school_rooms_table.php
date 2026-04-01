<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_rooms', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('grade_id');
            $table->string('name', 100);
            $table->integer('capacity')->nullable();
            $table->string('location', 100)->nullable();
            $table->integer('teacher_id')->nullable();
            $table->timestamps();
            $table->index(['grade_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_rooms');
    }
};
