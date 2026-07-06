<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('program_progress_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_program');
            $table->decimal('actual_progress', 5, 2);
            $table->timestamp('recorded_at');
            
            $table->foreign('id_program')->references('id_program')->on('programs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_progress_logs');
    }
};
