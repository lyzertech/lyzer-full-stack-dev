<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('labs_product_spec_values', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('spec_definition_id');

            // Flexible value columns — only one will be populated per row based on data_type
            $table->text('value_text')->nullable()->comment('For data_type: text, select');
            $table->bigInteger('value_number')->nullable()->comment('For data_type: number');
            $table->decimal('value_decimal', 20, 6)->nullable()->comment('For data_type: decimal');
            $table->boolean('value_boolean')->nullable()->comment('For data_type: boolean');
            $table->json('value_json')->nullable()->comment('For data_type: multi_select, range, arrays');

            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('labs_products')->cascadeOnDelete();
            $table->foreign('spec_definition_id')->references('id')->on('labs_spec_definitions')->cascadeOnDelete();
            $table->unique(['product_id', 'spec_definition_id'], 'uq_product_spec');

            $table->index(['product_id']);
            $table->index(['spec_definition_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labs_product_spec_values');
    }
};
