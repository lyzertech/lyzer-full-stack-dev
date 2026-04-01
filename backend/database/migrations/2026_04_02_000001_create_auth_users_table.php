<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_users', function (Blueprint $table) {
            $table->id('id');
            $table->string('firebase_uid', 128)->nullable()->unique();
            $table->string('email', 255)->unique();
            $table->boolean('email_verified')->default(0);
            $table->string('display_name', 255)->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->string('phone_number', 50)->nullable();
            $table->boolean('phone_verified')->default(0);
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->text('bio')->nullable();
            $table->string('timezone', 100)->default("UTC");
            $table->string('locale', 20)->default("en_US");
            $table->string('language', 10)->default("en");
            $table->enum('status', ['Active', 'Inactive', 'Suspended', 'Banned', 'PendingVerification'])->default('Active');
            $table->boolean('is_active')->default(1);
            $table->boolean('is_suspended')->default(0);
            $table->timestamp('suspended_until')->nullable();
            $table->text('suspension_reason')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->boolean('two_factor_enabled')->default(0);
            $table->string('two_factor_secret', 255)->nullable();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->text('metadata')->nullable();
            $table->string('password', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['firebase_uid']);
            $table->index(['email']);
            $table->index(['status']);
            $table->index(['is_active']);
            $table->index(['tenant_id']);
            $table->index(['last_login_at']);
            $table->index(['created_at']);
            $table->index(['deleted_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_users');
    }
};
