<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    protected $table = 'stages';
    protected $primaryKey = 'id_stage';
    public $timestamps = true;

    protected $fillable = [
        'id_program', 'name', 'order_index', 'deliverable', 'id_status', 'plan_start', 'plan_finish', 'notes'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class, 'id_program', 'id_program');
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class, 'id_stage', 'id_stage');
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'id_status', 'id_status');
    }
}
