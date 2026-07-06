<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Seed dummy users ke tabel `users`.
     * Kolom `nip` adalah primary key string (character varying 20).
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'nip'        => '199001012020011001',
                'name'       => 'Budi Santoso',
                'username'   => 'budi.santoso',
                'password'   => Hash::make('password123'),
                'role'       => 'admin',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nip'        => '199205152019022002',
                'name'       => 'Siti Rahma',
                'username'   => 'siti.rahma',
                'password'   => Hash::make('password123'),
                'role'       => 'pic',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nip'        => '198807302018031003',
                'name'       => 'Andi Wijaya',
                'username'   => 'andi.wijaya',
                'password'   => Hash::make('password123'),
                'role'       => 'pic',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nip'        => '199503102021041004',
                'name'       => 'Dewi Lestari',
                'username'   => 'dewi.lestari',
                'password'   => Hash::make('password123'),
                'role'       => 'viewer',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
