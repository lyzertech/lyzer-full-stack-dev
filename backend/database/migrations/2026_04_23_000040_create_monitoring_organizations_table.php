<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('code', 50)->unique()->comment('Short code for asset tagging, e.g. LYZ');
            $table->string('industry', 100)->nullable();
            $table->text('headquarters_address')->nullable();
            $table->string('website', 255)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->enum('tier', ['Standard', 'Premium', 'Enterprise'])->default('Standard');
            $table->enum('status', ['Active', 'Maintenance', 'Suspended'])->default('Active');
            $table->string('logo_url', 500)->nullable();
            $table->json('metadata')->nullable()->comment('Future proofing for extra attributes');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status']);
            $table->index(['tier']);
            $table->index(['is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_organizations');
    }
};
