<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bank extends Model
{
    use HasFactory;

    protected $table = 'finance_banks';

    protected $fillable = [
        'name',
        'code',
        'account_number',
        'routing_number',
        'branch',
        'contact_person',
        'contact_phone',
        'contact_email',
        'website',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function accounts()
    {
        return $this->hasMany(Account::class, 'bank_id');
    }
}
