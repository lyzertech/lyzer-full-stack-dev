<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = 'pointplus_products';

    protected $fillable = [
        'barcode',
        'sku',
        'product_name',
        'category_id',
        'brand',
        'supplier_id',
        'unit',
        'purchase_price',
        'selling_price',
        'stock',
        'minimum_stock',
        'image',
        'description',
        'status',
    ];
}
