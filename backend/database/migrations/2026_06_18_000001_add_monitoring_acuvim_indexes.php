<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('monitoring_acuvim', function (Blueprint $table) {
            $table->index(['device_serial', 'Timestamp'], 'idx_acuvim_serial_ts');
            $table->index(['device_name', 'device_serial', 'Timestamp'], 'idx_acuvim_name_serial_ts');
            $table->index('Timestamp', 'idx_acuvim_timestamp');
        });
    }

    public function down(): void
    {
        Schema::table('monitoring_acuvim', function (Blueprint $table) {
            $table->dropIndex('idx_acuvim_serial_ts');
            $table->dropIndex('idx_acuvim_name_serial_ts');
            $table->dropIndex('idx_acuvim_timestamp');
        });
    }
};
