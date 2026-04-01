<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('explore_users', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('username', 50)->unique();
            $table->string('display_name', 100);
            $table->string('email', 255)->nullable()->unique();
            $table->text('bio')->nullable();
            $table->string('avatar', 500)->nullable();
            $table->boolean('is_private')->default(0);
            $table->boolean('is_verified')->default(0);
            $table->boolean('is_active')->default(1);
            $table->integer('followers_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->integer('posts_count')->default(0);
            $table->timestamps();
            $table->index(['user_id']);
            $table->index(['username']);
            $table->index(['email']);
            $table->index(['is_active']);
            $table->index(['is_private']);
            $table->index(['created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('explore_users');
    }
};
