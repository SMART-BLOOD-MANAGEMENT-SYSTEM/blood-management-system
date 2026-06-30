<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'password_hash',
        'phone',
        'city',
        'blood_type',
        'gender',
        'birth_date',
        'role',
        'is_eligible',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    // عشان Laravel يعرف إن password_hash هو كلمة السر
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
            'is_eligible' => 'boolean',
        ];
    }
}
