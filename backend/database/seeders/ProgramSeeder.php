<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProgramSeeder extends Seeder
{
    /**
     * Seed dummy programs ke tabel `programs`.
     * Membutuhkan tabel `statuses` sudah terisi terlebih dahulu.
     */
    public function run(): void
    {
        DB::table('programs')->insert([
            [
                'name'                     => 'Digitalisasi Layanan Publik',
                'type'                     => 'Strategic',
                'id_status'                => 2, // On Progress
                'code_initiative_strategy' => null,
                'description'              => 'Program transformasi digital untuk layanan masyarakat.',
                'plan_start'               => '2026-01-01',
                'plan_finish'              => '2026-12-31',
                'created_at'               => Carbon::now(),
                'updated_at'               => Carbon::now(),
            ],
            [
                'name'                     => 'Peningkatan SDM Internal',
                'type'                     => 'Operational',
                'id_status'                => 1, // Not Started
                'code_initiative_strategy' => null,
                'description'              => 'Program pelatihan dan pengembangan kapasitas pegawai.',
                'plan_start'               => '2026-03-01',
                'plan_finish'              => '2026-09-30',
                'created_at'               => Carbon::now(),
                'updated_at'               => Carbon::now(),
            ],
            [
                'name'                     => 'Modernisasi Infrastruktur IT',
                'type'                     => 'Strategic',
                'id_status'                => 2, // On Progress
                'code_initiative_strategy' => null,
                'description'              => 'Pembaruan server, jaringan, dan keamanan siber.',
                'plan_start'               => '2026-02-01',
                'plan_finish'              => '2026-11-30',
                'created_at'               => Carbon::now(),
                'updated_at'               => Carbon::now(),
            ],
            [
                'name'                     => 'Reformasi Birokrasi Tahap II',
                'type'                     => 'Regulatory',
                'id_status'                => 3, // Done
                'code_initiative_strategy' => null,
                'description'              => 'Penyederhanaan prosedur administrasi internal.',
                'plan_start'               => '2025-07-01',
                'plan_finish'              => '2026-06-30',
                'created_at'               => Carbon::now(),
                'updated_at'               => Carbon::now(),
            ],
            [
                'name'                     => 'Penguatan Tata Kelola Data',
                'type'                     => 'Operational',
                'id_status'                => 4, // Hold
                'code_initiative_strategy' => null,
                'description'              => 'Standarisasi pengelolaan dan keamanan data organisasi.',
                'plan_start'               => '2026-05-01',
                'plan_finish'              => '2026-10-31',
                'created_at'               => Carbon::now(),
                'updated_at'               => Carbon::now(),
            ],
        ]);
    }
}
