<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel `sub_subtasks` — level terdalam dari hierarki tugas:
     *   Program -> Stage -> Subtask -> Sub-Subtask
     *
     * Relasi:
     *   - sub_subtasks.id_subtask -> subtasks.id_subtask (cascade delete)
     *   - sub_subtasks.id_status  -> statuses.id_status
     */
    public function up(): void
    {
        Schema::create('sub_subtasks', function (Blueprint $table) {
            $table->id(); // serial, auto-increment primary key

            $table->unsignedBigInteger('id_subtask');
            $table->string('name', 255);
            $table->string('deliverable', 255)->nullable();
            $table->unsignedBigInteger('id_status');

            // Nama kolom sesuai spesifikasi: plan_start_date & plan_finish_date
            $table->date('plan_start_date');
            $table->date('plan_finish_date');

            // Persentase progres dengan 2 desimal — sesuai ERD: numeric(5,2)
            $table->decimal('actual_progress', 5, 2)->default(0.00);

            $table->timestamps();

            $table->foreign('id_subtask')
                  ->references('id_subtask')
                  ->on('subtasks')
                  ->onDelete('cascade');

            $table->foreign('id_status')
                  ->references('id_status')
                  ->on('statuses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_subtasks');
    }
};
