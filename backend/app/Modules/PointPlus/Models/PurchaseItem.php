<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $table = 'pointplus_purchase_items';

    protected $fillable = [
        'purchase_id',
        'product_id',
        'quantity',
        'price',
        'subtotal',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
