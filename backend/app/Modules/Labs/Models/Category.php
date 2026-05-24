<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'labs_categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'parent_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    /**
     * Spec definitions assigned to this category via the pivot table.
     */
    public function specDefinitions()
    {
        return $this->belongsToMany(
            SpecDefinition::class,
            'labs_category_spec_maps',
            'category_id',
            'spec_definition_id'
        )->withPivot(['is_required', 'sort_order'])->orderByPivot('sort_order');
    }
}
