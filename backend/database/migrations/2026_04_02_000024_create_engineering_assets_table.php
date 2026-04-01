<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_assets', function (Blueprint $table) {
            $table->id('id');
            $table->string('name', 255);
            $table->string('asset_code', 100)->nullable()->unique();
            $table->enum('type', ['machine', 'tool', 'equipment', 'facility', 'vehicle', 'other']);
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('serial_number', 100)->nullable();
            $table->string('location', 255)->nullable();
            $table->string('department', 100)->nullable();
            $table->enum('status', ['operational', 'maintenance', 'broken', 'retired']);
            $table->text('description')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->text('metadata')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['type']);
            $table->index(['status']);
            $table->index(['location']);
            $table->index(['department']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_assets');
    }
};
