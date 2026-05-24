<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SpecDefinition extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'labs_spec_definitions';

    protected $fillable = [
        'spec_name',
        'spec_key',
        'data_type',
        'unit',
        'group_name',
        'options',
        'is_filterable',
        'sort_order',
        'description',
    ];

    protected $casts = [
        'options'       => 'array',
        'is_filterable' => 'boolean',
        'sort_order'    => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function productSpecValues()
    {
        return $this->hasMany(ProductSpecValue::class, 'spec_definition_id');
    }

    /**
     * Categories that include this spec.
     */
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'labs_category_spec_maps',
            'spec_definition_id',
            'category_id'
        )->withPivot(['is_required', 'sort_order']);
    }
}
