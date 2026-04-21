<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'finance_transactions';

    protected $fillable = [
        'transaction_type',
        'account_id',
        'transfer_to_account_id',
        'category_id',
        'amount',
        'balance_after',
        'description',
        'reference_number',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'amount'           => 'float',
        'balance_after'    => 'float',
        'transaction_date' => 'date',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function transferToAccount()
    {
        return $this->belongsTo(Account::class, 'transfer_to_account_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
