<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('explore_posts', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->text('content');
            $table->string('media_url', 500)->nullable();
            $table->unsignedBigInteger('reply_to_id')->nullable();
            $table->unsignedBigInteger('repost_of_id')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->boolean('is_private')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('replies_count')->default(0);
            $table->integer('reposts_count')->default(0);
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['reply_to_id']);
            $table->index(['repost_of_id']);
            $table->index(['is_deleted']);
            $table->index(['is_private']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('explore_posts');
    }
};
