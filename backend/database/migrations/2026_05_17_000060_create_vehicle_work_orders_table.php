<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('work_order_number', 50)->unique();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->unsignedBigInteger('assigned_technician_id')->nullable(); // auth_users.id
            $table->date('service_date');
            $table->date('completion_date')->nullable();
            $table->decimal('odometer_in', 12, 1)->nullable();
            $table->decimal('odometer_out', 12, 1)->nullable();
            $table->enum('service_type', ['Preventive', 'Corrective', 'Emergency', 'Inspection'])->default('Preventive');
            $table->text('complaint')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('action_taken')->nullable();
            $table->decimal('labor_cost', 15, 2)->default(0);
            $table->decimal('sparepart_cost', 15, 2)->default(0);
            $table->decimal('other_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->enum('status', ['Draft', 'Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Draft');
            $table->unsignedBigInteger('approved_by')->nullable(); // auth_users.id
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();
            $table->foreign('vendor_id')->references('id')->on('vehicle_vendors')->nullOnDelete();

            $table->index(['vehicle_id']);
            $table->index(['status']);
            $table->index(['service_date']);
            $table->index(['vendor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_work_orders');
    }
};
