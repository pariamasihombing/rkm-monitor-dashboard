<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel `initiative_strategies`.
     * Primary key menggunakan `code` (string, 20) bukan auto-increment integer,
     * sesuai dengan tipe character varying(20) pada PostgreSQL.
     * Tabel ini direferensikan oleh kolom `code_initiative_strategy` di tabel `programs`.
     */
    public function up(): void
    {
        Schema::create('initiative_strategies', function (Blueprint $table) {
            $table->string('code', 20)->primary();
            $table->text('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('initiative_strategies');
    }
};
