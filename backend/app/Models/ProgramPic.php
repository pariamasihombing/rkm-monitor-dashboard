<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramPic extends Model
{
    protected $table = 'program_pics';
    public $timestamps = false;

    protected $fillable = ['id_program', 'nip_user'];

    public function user()
    {
        return $this->belongsTo(User::class, 'nip_user', 'nip');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'id_program', 'id_program');
    }
}
