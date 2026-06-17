<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('statuses')->insert([
            ['id_status' => 1, 'name' => 'Not Started'],
            ['id_status' => 2, 'name' => 'On Progress'],
            ['id_status' => 3, 'name' => 'Done'],
            ['id_status' => 4, 'name' => 'Hold'],
        ]);
    }
}
