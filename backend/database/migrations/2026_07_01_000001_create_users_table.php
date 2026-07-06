<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel `users`.
     * Primary key menggunakan `nip` (string, 20) bukan auto-increment integer,
     * sesuai dengan tipe character varying(20) pada PostgreSQL.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('nip', 20)->primary();
            $table->string('name', 100);
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->string('role', 10);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
