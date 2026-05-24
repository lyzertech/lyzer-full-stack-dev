<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('labs_category_spec_maps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('spec_definition_id');
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('labs_categories')->cascadeOnDelete();
            $table->foreign('spec_definition_id')->references('id')->on('labs_spec_definitions')->cascadeOnDelete();
            $table->unique(['category_id', 'spec_definition_id'], 'uq_category_spec');
            $table->index(['category_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labs_category_spec_maps');
    }
};
