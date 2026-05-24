<?php

namespace App\Modules\PointPlus\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'pointplus_suppliers';

    protected $fillable = [
        'supplier_name',
        'company',
        'phone',
        'email',
        'address',
        'notes',
    ];
}
