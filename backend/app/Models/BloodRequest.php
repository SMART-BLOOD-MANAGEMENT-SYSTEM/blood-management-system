<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodRequest extends Model
{
    protected $fillable = [
    'bank_id',
    'user_id',
    'blood_type',
    'units_needed',
    'urgency_level',
    'patient_name',
    'status',
    'reason',
];

    public function bloodBank()
    {
        return $this->belongsTo(BloodBank::class, 'bank_id');
    }
}
