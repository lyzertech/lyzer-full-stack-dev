<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('school_code', 50)->nullable()->unique();
            $table->string('school_name', 255);
            $table->string('short_name', 100)->nullable();
            $table->string('address_line1', 255)->nullable();
            $table->string('address_line2', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('fax', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('contact_person_name', 255)->nullable();
            $table->string('contact_person_phone', 50)->nullable();
            $table->string('contact_person_email', 255)->nullable();
            $table->string('logo_url', 255)->nullable();
            $table->string('favicon_url', 255)->nullable();
            $table->string('timezone', 100)->default("UTC");
            $table->string('locale', 20)->default("en_US");
            $table->date('academic_year_start')->nullable();
            $table->date('academic_year_end')->nullable();
            $table->string('default_language', 20)->default("en");
            $table->string('default_currency', 10)->nullable();
            $table->string('registration_number', 100)->nullable();
            $table->string('tax_id', 100)->nullable();
            $table->boolean('sms_enabled')->default(0);
            $table->string('sms_provider', 100)->nullable();
            $table->text('extra')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
