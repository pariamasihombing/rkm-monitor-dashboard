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
        Schema::create('statuses', function (Blueprint $table) {
            $table->id('id_status');
            $table->string('name');
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id('id_program');
            $table->string('name');
            $table->string('type');
            $table->unsignedBigInteger('id_status');
            $table->string('code_initiative_strategy')->nullable();
            $table->text('description')->nullable();
            $table->date('plan_start');
            $table->date('plan_finish');
            $table->timestamps();

            $table->foreign('id_status')->references('id_status')->on('statuses');
        });

        Schema::create('stages', function (Blueprint $table) {
            $table->id('id_stage');
            $table->unsignedBigInteger('id_program');
            $table->string('name');
            $table->integer('order_index')->default(0);
            $table->string('deliverable')->nullable();
            $table->unsignedBigInteger('id_status');
            $table->date('plan_start');
            $table->date('plan_finish');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('id_program')->references('id_program')->on('programs')->onDelete('cascade');
            $table->foreign('id_status')->references('id_status')->on('statuses');
        });

        Schema::create('subtasks', function (Blueprint $table) {
            $table->id('id_subtask');
            $table->unsignedBigInteger('id_stage');
            $table->string('name');
            $table->string('deliverable')->nullable();
            $table->unsignedBigInteger('id_status');
            $table->date('plan_start');
            $table->date('plan_finish');
            $table->integer('actual_progress')->default(0);
            $table->timestamps();

            $table->foreign('id_stage')->references('id_stage')->on('stages')->onDelete('cascade');
            $table->foreign('id_status')->references('id_status')->on('statuses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subtasks');
        Schema::dropIfExists('stages');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('statuses');
    }
};
