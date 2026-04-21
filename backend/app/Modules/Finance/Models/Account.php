<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory;

    protected $table = 'finance_accounts';

    protected $fillable = [
        'bank_id',
        'name',
        'account_number',
        'account_type',
        'currency',
        'initial_balance',
        'current_balance',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'initial_balance' => 'float',
        'current_balance' => 'float',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class, 'bank_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'account_id');
    }
}
