<?php

namespace App\Modules\School\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $table = 'school_students';

    protected $fillable = [
        'name',
        'student_id',
        'gender',
        'date_of_birth',
        'class',
        'email',
        'phone',
        'address',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];
}
