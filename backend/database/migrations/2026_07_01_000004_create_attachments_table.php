<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel `attachments` — menyimpan file yang di-upload.
     * Attachment bisa terhubung ke sebuah stage, subtask, atau keduanya,
     * sehingga kedua kolom FK dibuat nullable.
     *
     * Relasi:
     *   - attachments.id_stage   -> stages.id_stage     (nullable, cascade delete)
     *   - attachments.id_subtask -> subtasks.id_subtask  (nullable, cascade delete)
     */
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id(); // serial, auto-increment primary key

            $table->unsignedBigInteger('id_stage')->nullable();
            $table->unsignedBigInteger('id_subtask')->nullable();

            $table->string('file_name', 255);
            $table->text('file_url');

            // Menggunakan timestamp eksplisit sesuai ERD (bukan timestamps())
            $table->timestamp('uploaded_at')->nullable();

            $table->foreign('id_stage')
                  ->references('id_stage')
                  ->on('stages')
                  ->onDelete('cascade');

            $table->foreign('id_subtask')
                  ->references('id_subtask')
                  ->on('subtasks')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
