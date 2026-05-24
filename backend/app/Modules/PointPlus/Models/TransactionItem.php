<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransactionItem extends Model
{
    use HasFactory;

    protected $table = 'pointplus_transaction_items';

    protected $fillable = [
        'transaction_id',
        'product_id',
        'quantity',
        'price',
        'discount',
        'subtotal',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
