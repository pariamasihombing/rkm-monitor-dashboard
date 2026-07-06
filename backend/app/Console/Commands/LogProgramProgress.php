<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Program;
use App\Services\ProgressService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LogProgramProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'program:log-progress';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Log actual progress of all active programs';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle(ProgressService $progressService)
    {
        $programs = Program::all();
        $now = Carbon::now();

        foreach ($programs as $program) {
            $metrics = $progressService->calculateMetrics($program, 'program');
            
            DB::table('program_progress_logs')->insert([
                'id_program' => $program->id_program,
                'actual_progress' => $metrics['actual_progress'],
                'recorded_at' => $now
            ]);
        }

        $this->info('Program progress logged successfully.');
    }
}
