<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'full_name' => 'Admin',
            'email' => 'admin@test.com',
            'password_hash' => Hash::make('123456'),
            'phone' => '0599000001',
            'role' => 'admin',
        ]);
    }
}
