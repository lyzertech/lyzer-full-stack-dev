<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{
    use HasFactory;

    protected $table = 'pointplus_purchases';

    protected $fillable = [
        'supplier_id',
        'invoice_number',
        'purchase_date',
        'total',
        'status',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class, 'purchase_id');
    }
}
