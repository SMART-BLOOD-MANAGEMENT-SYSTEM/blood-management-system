<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodInventory extends Model
{
    protected $table = 'blood_inventory';

   protected $fillable = [
    'blood_bank_id',
    'blood_type',
    'units',
    'expiration_date',
];

    public function bloodBank()
    {
        return $this->belongsTo(BloodBank::class, 'blood_bank_id');
    }
}
