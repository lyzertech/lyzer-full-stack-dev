<?php

namespace App\Modules\School\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolRoom extends Model
{
    protected $table = 'school_rooms';

    protected $fillable = [
        'grade_id',
        'name',
        'capacity',
        'location',
        'teacher_id',
    ];

    public function grade(): BelongsTo
    {
        return $this->belongsTo(SchoolGrade::class, 'grade_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(SchoolTeacher::class, 'teacher_id');
    }
}
