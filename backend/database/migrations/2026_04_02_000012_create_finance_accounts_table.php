<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('finance_accounts', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('bank_id');
            $table->string('name', 255);
            $table->string('account_number', 100)->nullable();
            $table->enum('account_type', ['Checking', 'Savings', 'Credit', 'Investment', 'Cash', 'Other'])->default('Checking');
            $table->string('currency', 10)->default("USD");
            $table->decimal('initial_balance', 15, 2)->default(0.00);
            $table->decimal('current_balance', 15, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->index(['bank_id']);
            $table->index(['account_type']);
            $table->index(['is_active']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('finance_accounts');
    }
};
