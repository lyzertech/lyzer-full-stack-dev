<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id('id');
            $table->enum('transaction_type', ['Income', 'Expense', 'Transfer']);
            $table->unsignedInteger('account_id');
            $table->unsignedInteger('transfer_to_account_id')->nullable();
            $table->unsignedInteger('category_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('description')->nullable();
            $table->string('reference_number', 100)->nullable();
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['account_id']);
            $table->index(['transfer_to_account_id']);
            $table->index(['category_id']);
            $table->index(['transaction_type']);
            $table->index(['transaction_date']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('finance_transactions');
    }
};
