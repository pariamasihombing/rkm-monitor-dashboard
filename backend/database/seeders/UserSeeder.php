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
                'name'       => 'Akun PIC Dummy',
                'username'   => 'akun.pic',
                'password'   => Hash::make('password123'),
                'role'       => 'pic',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nip'        => '199205152019022002',
                'name'       => 'Akun Guest Dummy',
                'username'   => 'akun.guest',
                'password'   => Hash::make('password123'),
                'role'       => 'guest',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}