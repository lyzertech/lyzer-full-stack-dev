<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_students', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nis', 50)->unique();
            $table->string('name', 255);
            $table->enum('gender', ['Male', 'Female', 'Other'])->default('Male');
            $table->date('date_of_birth')->nullable();
            $table->unsignedInteger('grade')->nullable();
            $table->unsignedInteger('room')->nullable();
            $table->string('parent_name', 255)->nullable();
            $table->string('parent_phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->string('qr_hash', 128)->nullable()->unique();
            $table->timestamps();
            $table->index(['grade']);
            $table->index(['room']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_students');
    }
};
