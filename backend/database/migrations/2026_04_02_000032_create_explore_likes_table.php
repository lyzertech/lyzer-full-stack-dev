<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('explore_likes', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('post_id');
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['post_id']);
            $table->index(['created_at']);
            $table->unique(['user_id', 'post_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('explore_likes');
    }
};
