<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('finance_banks', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255);
            $table->string('code', 50)->nullable();
            $table->string('account_number', 100)->nullable();
            $table->string('routing_number', 50)->nullable();
            $table->string('branch', 255)->nullable();
            $table->string('contact_person', 255)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->string('website', 255)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['name']);
            $table->index(['code']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('finance_banks');
    }
};
