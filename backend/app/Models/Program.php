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
                $totalProgress += $subtask->actual_progress;
            }
        }

        if ($totalSubtasks === 0) {
            return 0;
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
}
