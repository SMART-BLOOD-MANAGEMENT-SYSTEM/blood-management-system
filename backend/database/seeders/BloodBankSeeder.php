<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BloodBank;

class BloodBankSeeder extends Seeder
{
    public function run(): void
    {
        BloodBank::create([
            'name' => 'Al-Shifa Hospital',
            'city' => 'Gaza City',
            'address' => 'Omar Al-Mukhtar Street',
            'phone' => '+970-8-2677700',
        ]);

        BloodBank::create([
            'name' => 'European Gaza Hospital',
            'city' => 'Khan Younis',
            'address' => 'Khan Younis Street',
            'phone' => '+970-8-2067890',
        ]);
    }
}
