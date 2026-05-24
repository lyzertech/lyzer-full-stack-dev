<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'labs_products';

    protected $fillable = [
        'brand_id',
        'category_id',
        'product_name',
        'model',
        'sku',
        'description',
        'image',
        'datasheet',
        'specs_cache',
        'status',
    ];

    protected $casts = [
        'specs_cache' => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function specValues()
    {
        return $this->hasMany(ProductSpecValue::class, 'product_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Rebuild and persist the specs_cache JSON from live spec values.
     * Call this after saving/updating spec values.
     */
    public function rebuildSpecsCache(): void
    {
        $values = $this->specValues()->with('specDefinition')->get();

        $cache = [];
        foreach ($values as $sv) {
            $def   = $sv->specDefinition;
            $value = $sv->resolvedValue();

            $cache[$def->spec_key] = [
                'label'     => $def->spec_name,
                'group'     => $def->group_name,
                'unit'      => $def->unit,
                'data_type' => $def->data_type,
                'value'     => $value,
            ];
        }

        $this->update(['specs_cache' => $cache]);
    }
}
