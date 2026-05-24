<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'pointplus_transactions';

    protected $fillable = [
        'transaction_number',
        'subtotal',
        'discount',
        'tax',
        'total',
        'payment_method',
        'amount_paid',
        'change',
        'status',
        'cashier_id',
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }
}
