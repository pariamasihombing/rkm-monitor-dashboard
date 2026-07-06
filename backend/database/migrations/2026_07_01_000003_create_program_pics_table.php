<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel `program_pics` — tabel pivot antara `programs` dan `users`.
     *
     * Relasi:
     *   - program_pics.id_program -> programs.id_program (cascade delete)
     *   - program_pics.nip_user   -> users.nip          (cascade delete)
     */
    public function up(): void
    {
        Schema::create('program_pics', function (Blueprint $table) {
            $table->id(); // serial, auto-increment primary key

            $table->unsignedBigInteger('id_program');
            $table->string('nip_user', 20);

            $table->foreign('id_program')
                  ->references('id_program')
                  ->on('programs')
                  ->onDelete('cascade');

            $table->foreign('nip_user')
                  ->references('nip')
                  ->on('users')
                  ->onDelete('cascade');

            // Satu PIC tidak boleh didaftarkan dua kali untuk program yang sama
            $table->unique(['id_program', 'nip_user']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_pics');
    }
};
