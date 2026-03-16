<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labs_qc_reports', function (Blueprint $table) {
            $table->id();
            $table->string('sample_id', 100);
            $table->string('test_name');
            $table->enum('result', ['pass', 'fail', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->datetime('tested_at');
            $table->foreignId('tested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labs_qc_reports');
    }
};
