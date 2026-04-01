<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('explore_follows', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('follower_id');
            $table->unsignedBigInteger('following_id');
            $table->timestamps();
            $table->index(['follower_id']);
            $table->index(['following_id']);
            $table->index(['created_at']);
            $table->unique(['follower_id', 'following_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('explore_follows');
    }
};
