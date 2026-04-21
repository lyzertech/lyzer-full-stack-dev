<?php

namespace App\Modules\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sales_customers';

    protected $fillable = [
        'customer_code',
        'name',
        'email',
        'sales',
        'area',
        'company',
        'position',
        'address',
        'phone_number',
        'mobile_phone',
        'category',
        'status',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
