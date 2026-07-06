<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Urutan pemanggilan WAJIB diperhatikan karena ada foreign key:
     *   1. StatusSeeder  — tabel `statuses` (tidak ada dependensi)
     *   2. UserSeeder    — tabel `users`    (tidak ada dependensi)
     *   3. ProgramSeeder — tabel `programs` (butuh `statuses`)
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            StatusSeeder::class,  // 1. Harus pertama — direferensikan oleh programs & subtasks
            UserSeeder::class,    // 2. Harus sebelum program_pics
            ProgramSeeder::class, // 3. Butuh statuses sudah ada
        ]);
    }
}
