<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Program;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Program::create(['name' => 'Program A', 'description' => 'Deskripsi Program A']);
        Program::create(['name' => 'Program B', 'description' => 'Deskripsi Program B']);
        Program::create(['name' => 'Program C', 'description' => 'Deskripsi Program C']);
    }
}
