<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subtask extends Model
{
    protected $table = 'subtasks';
    protected $primaryKey = 'id_subtask';
    public $timestamps = true;

    protected $fillable = [
        'id_stage', 'name', 'deliverable', 'id_status', 'plan_start', 'plan_finish', 'actual_progress', 'file'
    ];

    public function stage()
    {
        return $this->belongsTo(Stage::class, 'id_stage', 'id_stage');
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'id_status', 'id_status');
    }
}
