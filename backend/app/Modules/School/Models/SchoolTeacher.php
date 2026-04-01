<?php

namespace App\Modules\School\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolTeacher extends Model
{
    use HasFactory;

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

    /**
     * Boot the model.
     * Generate canonical NIP (YYYMMDD + ID) when saving.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($teacher) {
            $ymd = date('Ymd');
            $paddedId = str_pad($teacher->id, 3, '0', STR_PAD_LEFT);
            $finalNip = $ymd . $paddedId;
            $teacher->nip = $finalNip;
            $teacher->save();
        });
    }
}
