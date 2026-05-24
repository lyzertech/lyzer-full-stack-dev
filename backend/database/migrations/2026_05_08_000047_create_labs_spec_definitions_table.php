<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('labs_spec_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('spec_name', 255)->comment('Human readable label e.g. "Voltage Input"');
            $table->string('spec_key', 100)->unique()->comment('Machine key e.g. voltage_input');
            $table->enum('data_type', [
                'text',
                'number',
                'decimal',
                'boolean',
                'select',
                'multi_select',
                'range',
            ])->default('text');
            $table->string('unit', 50)->nullable()->comment('e.g. V, A, Hz, °C');
            $table->string('group_name', 100)->nullable()->comment('Grouping header e.g. "Electrical", "Communication"');
            $table->json('options')->nullable()->comment('For select/multi_select: ["Option A","Option B"]');
            $table->boolean('is_filterable')->default(false)->comment('Expose as filter in product listing');
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['spec_key']);
            $table->index(['group_name']);
            $table->index(['is_filterable']);
            $table->index(['data_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labs_spec_definitions');
    }
};
