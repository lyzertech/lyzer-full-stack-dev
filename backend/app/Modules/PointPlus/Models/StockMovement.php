<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockMovement extends Model
{
    use HasFactory;

    protected $table = 'pointplus_stock_movements';

    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
