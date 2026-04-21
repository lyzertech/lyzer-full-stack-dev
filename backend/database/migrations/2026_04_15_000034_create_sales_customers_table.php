<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_customers', function (Blueprint $table) {
            $table->id('id');

            // Human-friendly ID shown in UI (e.g. "CUST-000001")
            $table->string('customer_code', 50)->unique();

            $table->string('name', 255);
            $table->string('email', 255)->nullable();

            // Salesperson (auth_users.id) who owns/handles this customer
            $table->unsignedBigInteger('sales_user_id')->nullable();

            // Geo / segmentation
            $table->string('area', 120)->nullable();

            // Contact / org info
            $table->string('company', 255)->nullable();
            $table->string('position', 120)->nullable();
            $table->text('address')->nullable();

            // Keep both for backward-compat with your screenshot + future flexibility
            $table->string('phone_number', 50)->nullable();
            $table->string('mobile_phone', 50)->nullable();

            // Salesperson name (plain text — flexible for now)
            $table->string('sales', 120)->nullable();

            // Customer category (e.g. End-User, Panel Maker …)
            $table->string('category', 120)->nullable();

            $table->enum('status', ['Active', 'Inactive', 'Prospect', 'Blacklisted'])->default('Active');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_code']);
            $table->index(['name']);
            $table->index(['email']);
            $table->index(['sales_user_id']);
            $table->index(['area']);
            $table->index(['company']);
            $table->index(['status']);
            $table->index(['created_at']);
            $table->index(['deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_customers');
    }
};
