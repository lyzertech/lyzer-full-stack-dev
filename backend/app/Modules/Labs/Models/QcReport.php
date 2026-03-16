<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QcReport extends Model
{
    use HasFactory;

    protected $table = 'labs_qc_reports';

    protected $fillable = [
        'sample_id',
        'test_name',
        'result',       // pass | fail | pending
        'notes',
        'tested_at',
        'tested_by',
    ];

    protected $casts = [
        'tested_at' => 'datetime',
    ];
}
