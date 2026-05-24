<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_telemetry_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id');
            $table->string('metric_name', 100)->comment('voltage_l1, current, active_power, etc.');
            $table->decimal('metric_value', 20, 8);
            $table->string('unit', 20)->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->json('raw_data')->nullable()->comment('Original payload for auditing');

            $table->foreign('device_id')->references('id')->on('monitoring_devices')->onDelete('cascade');
            $table->index(['device_id', 'recorded_at']);
            $table->index(['metric_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_telemetry_logs');
    }
};
