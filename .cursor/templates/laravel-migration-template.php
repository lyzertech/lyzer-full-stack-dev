<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * {{MigrationDescription}}
 * Following Lyzer modular architecture rules
 * Table: {{tableName}}
 * Generated for: {{ModuleName}} module
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('{{tableName}}', function (Blueprint $table) {
            $table->id();
            
            // Add your columns here
            // Example columns:
            // $table->string('name');
            // $table->text('description')->nullable();
            // $table->enum('status', ['active', 'inactive'])->default('active');
            // $table->decimal('price', 10, 2)->nullable();
            // $table->boolean('is_featured')->default(false);
            
            // Foreign keys (if needed)
            // $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            
            // Standard timestamps
            $table->timestamps();
            $table->softDeletes(); // For soft delete functionality
            
            // Indexes for performance
            // $table->index(['status', 'created_at']);
            // $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('{{tableName}}');
    }
};