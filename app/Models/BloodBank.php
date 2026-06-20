<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodBank extends Model
{
    protected $fillable = [
        'name',
        'city',
        'address',
        'phone',
        'email',
        'latitude',
        'longitude',
        'contact_number',
        'facility_type',
        'working_hours',
        'operational_status',
    ];

    public function bloodRequests()
    {
        return $this->hasMany(BloodRequest::class, 'bank_id');
    }
}
