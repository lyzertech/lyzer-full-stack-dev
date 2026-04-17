<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_visit_reports', function (Blueprint $table) {
            $table->id('id');

            // Human-friendly visit report ID (e.g. VR-000001)
            $table->string('id_visit_report', 50)->unique();

            $table->string('customer_name', 255);
            $table->string('sales', 255);
            $table->enum('office', ['AII', 'SEP'])->nullable();
            $table->string('location', 255)->nullable();
            $table->string('contact_person', 255)->nullable();
            $table->string('contact_number', 50)->nullable();

            $table->date('visit_date')->nullable();
            $table->time('visit_time')->nullable();

            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->text('customer_feedback')->nullable();
            $table->text('next_steps')->nullable();

            $table->date('follow_up_date')->nullable();
            $table->string('follow_up_date_status', 100)->nullable();
            $table->string('status', 100)->nullable();
            $table->string('prospek', 100)->nullable();

            $table->boolean('ack_manager')->default(false);
            $table->boolean('ack_director')->default(false);
            $table->boolean('ack_presdir')->default(false);

            $table->text('response')->nullable();
            $table->string('image', 255)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_visit_report']);
            $table->index(['customer_name']);
            $table->index(['sales']);
            $table->index(['office']);
            $table->index(['visit_date']);
            $table->index(['follow_up_date']);
            $table->index(['status']);
            $table->index(['created_at']);
            $table->index(['deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_visit_reports');
    }
};
