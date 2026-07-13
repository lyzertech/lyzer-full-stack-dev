<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_licenses', function (Blueprint $table) {
            $table->id();
            $table->string('license_key', 255)->unique()->comment('Unique license identifier');
            $table->enum('license_type', ['trial', 'standard', 'enterprise'])->default('standard');
            $table->string('issued_to', 255)->nullable()->comment('Company/Customer name');
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamp('expires_at')->nullable(false)->comment('License expiration date');
            $table->boolean('is_active')->default(true)->comment('Manual activation/deactivation flag');
            $table->json('metadata')->nullable()->comment('Additional license information');
            $table->timestamps();

            // Index for quick license validation queries
            $table->index(['is_active', 'expires_at'], 'idx_active_license');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_licenses');
    }
};
