<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_teachers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255);
            $table->string('degree', 100)->nullable();
            $table->string('email', 255);
            $table->string('subject', 255);
            $table->string('nip', 100);
            $table->enum('gender', ['Male', 'Female'])->default('Male');
            $table->enum('status', ['Active', 'OnLeave', 'Inactive'])->default('Active');
            $table->enum('job_type', ['Permanent', 'Contract'])->default('Permanent');
            $table->date('join_date')->nullable();
            $table->string('avatar', 255)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_teachers');
    }
};
