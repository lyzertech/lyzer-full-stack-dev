<?php

namespace App\Modules\Labs\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSpecValue extends Model
{
    use HasFactory;

    protected $table = 'labs_product_spec_values';

    protected $fillable = [
        'product_id',
        'spec_definition_id',
        'value_text',
        'value_number',
        'value_decimal',
        'value_boolean',
        'value_json',
    ];

    protected $casts = [
        'value_number'  => 'integer',
        'value_decimal' => 'float',
        'value_boolean' => 'boolean',
        'value_json'    => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function specDefinition()
    {
        return $this->belongsTo(SpecDefinition::class, 'spec_definition_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Return the resolved value based on the spec definition's data_type.
     */
    public function resolvedValue(): mixed
    {
        if (!$this->specDefinition) {
            return null;
        }

        return match ($this->specDefinition->data_type) {
            'number'       => $this->value_number,
            'decimal'      => $this->value_decimal,
            'boolean'      => $this->value_boolean,
            'multi_select',
            'range'        => $this->value_json,
            default        => $this->value_text,
        };
    }
}
