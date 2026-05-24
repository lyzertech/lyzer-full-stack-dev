<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'labs_brands';

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function products()
    {
        return $this->hasMany(Product::class, 'brand_id');
    }
}
