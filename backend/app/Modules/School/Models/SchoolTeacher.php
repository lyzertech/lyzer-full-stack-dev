<?php

namespace App\Modules\School\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolTeacher extends Model
{
    protected $table = 'school_teachers';

    protected $fillable = [
        'name',
        'degree',
        'email',
        'subject',
        'nip',
        'gender',
        'status',
        'job_type',
        'join_date',
        'avatar',
    ];

    protected $casts = [
        'join_date' => 'date',
    ];
}
