<?php

namespace App\Modules\School\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolGrade extends Model
{
    protected $table = 'school_grades';

    protected $fillable = [
        'name',
        'level',
        'description',
        'status',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(SchoolRoom::class, 'grade_id');
    }
}
