<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'finance_transactions';

    protected $fillable = [
        'title',
        'type',         // income | expense
        'amount',
        'description',
        'date',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'date'   => 'date',
    ];
}
