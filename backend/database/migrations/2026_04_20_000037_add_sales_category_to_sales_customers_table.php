<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds `sales` (plain-text salesperson name) and `category` (customer category)
 * columns to sales_customers, in case the table already exists without them.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('sales_customers', function (Blueprint $table) {
            if (!Schema::hasColumn('sales_customers', 'sales')) {
                $table->string('sales', 120)->nullable()->after('mobile_phone');
            }
            if (!Schema::hasColumn('sales_customers', 'category')) {
                $table->string('category', 120)->nullable()->after('sales');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sales_customers', function (Blueprint $table) {
            $table->dropColumn(['sales', 'category']);
        });
    }
};
