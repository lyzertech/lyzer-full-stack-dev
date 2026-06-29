<?php

namespace App\Modules\{{ModuleName}}\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * {{ModelName}} Model
 * Following Lyzer modular architecture rules
 * Location: app/Modules/{{ModuleName}}/Models/{{ModelName}}.php
 */
class {{ModelName}} extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = '{{tableName}}';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        // Add your fillable attributes here
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        // Add hidden attributes here (e.g., passwords, tokens)
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        // Add your casts here
    ];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot()
    {
        parent::boot();

        // Add any model events here
        static::creating(function ($model) {
            // Logic before creating
        });

        static::created(function ($model) {
            // Logic after creating
        });
    }

    // ===== RELATIONSHIPS =====

    /**
     * Example relationship
     */
    // public function relatedModel()
    // {
    //     return $this->belongsTo(RelatedModel::class);
    // }

    // ===== SCOPES =====

    /**
     * Scope for active records
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // ===== ACCESSORS & MUTATORS =====

    /**
     * Example accessor
     */
    // public function getFullNameAttribute()
    // {
    //     return $this->first_name . ' ' . $this->last_name;
    // }

    // ===== METHODS =====

    /**
     * Custom methods for business logic
     */
}