<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('auth_user_settings', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->boolean('email_notifications')->default(1);
            $table->boolean('push_notifications')->default(1);
            $table->boolean('sms_notifications')->default(0);
            $table->enum('profile_visibility', ['Public', 'Private', 'Friends', 'Custom'])->default('Public');
            $table->boolean('show_email')->default(0);
            $table->boolean('show_phone')->default(0);
            $table->string('theme', 20)->default("light");
            $table->string('language', 10)->default("en");
            $table->string('timezone', 100)->default("UTC");
            $table->string('date_format', 20)->default("YYYY-MM-DD");
            $table->string('time_format', 10)->default("24h");
            $table->integer('items_per_page')->default(20);
            $table->boolean('auto_save')->default(1);
            $table->text('custom_settings')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('auth_user_settings');
    }
};
