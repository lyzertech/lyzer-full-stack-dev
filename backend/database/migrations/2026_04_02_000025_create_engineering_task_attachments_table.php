<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('engineering_task_attachments', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('task_id');
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 50)->nullable();
            $table->integer('file_size')->nullable();
            $table->enum('attachment_type', ['photo', 'document', 'video', 'other'])->nullable();
            $table->string('description', 500)->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
            $table->index(['task_id']);
            $table->index(['attachment_type']);
            $table->index(['uploaded_by']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('engineering_task_attachments');
    }
};
