<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $table = 'programs';
    protected $primaryKey = 'id_program';
    
    // Matikan timestamps otomatis karena tabel Postgre kamu pakai 'created_at' manual
    public $timestamps = false;

    protected $fillable = [
        'name', 'type', 'pic', 'id_status', 'code_initiative_strategy', 'plan_start', 'plan_finish'
    ];

    protected $appends = ['overall_progress'];

    public function getOverallProgressAttribute()
    {
        $totalSubtasks = 0;
        $totalProgress = 0;

        foreach ($this->stages as $stage) {
            foreach ($stage->subtasks as $subtask) {
                $totalSubtasks++;
                $statusName = strtoupper(optional($subtask->status)->name ?? '');
                $statusId = (int) ($subtask->id_status ?? 0);
                $storedActual = (float) ($subtask->actual_progress ?? 0);

                if ($statusId === 3 || $statusName === 'DONE') {
                    $totalProgress += 100;
                } elseif ($statusId === 2 || $statusName === 'ON PROGRESS') {
                    $totalProgress += $storedActual > 0 ? $storedActual : 50;
                } else {
                    $totalProgress += $storedActual;
                }
            }
        }

        if ($totalSubtasks === 0) {
            $statusName = strtoupper(optional($this->status)->name ?? '');
            $statusId = (int) ($this->id_status ?? 0);
            $storedActual = (float) ($this->actual_progress ?? 0);

            if ($statusId === 3 || $statusName === 'DONE') {
                return 100;
            }

            if ($statusId === 2 || $statusName === 'ON PROGRESS') {
                return round($storedActual > 0 ? $storedActual : 50);
            }

            return round($storedActual);
        }

        return round($totalProgress / $totalSubtasks);
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'id_status', 'id_status');
    }

    public function stages()
    {
        return $this->hasMany(Stage::class, 'id_program', 'id_program');
    }

    /**
     * Relasi ke tabel pivot program_pics (tiap baris adalah satu PIC).
     * Bisa digunakan untuk whereHas('programPics.user', ...).
     */
    public function programPics()
    {
        return $this->hasMany(ProgramPic::class, 'id_program', 'id_program');
    }

    /**
     * BelongsToMany shortcut: langsung ke model User lewat pivot program_pics.
     */
    public function pics()
    {
        return $this->belongsToMany(
            User::class,
            'program_pics',
            'id_program',
            'nip_user',
            'id_program',
            'nip'
        );
    }
}
