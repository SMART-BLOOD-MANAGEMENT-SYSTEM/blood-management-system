<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationSlot extends Model
{
    protected $table = 'donation_slots';

    protected $fillable = [
        'bank_id',
        'slot_date',
        'start_time',
        'end_time',
        'max_capacity',
    ];

    public function bloodBank()
    {
        return $this->belongsTo(BloodBank::class, 'bank_id');
    }
}
