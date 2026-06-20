<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // الأمر في التيرمينال: php artisan make:migration create_blood_banks_table
Schema::create('blood_banks', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100);
    $table->string('address', 255);
    $table->string('phone', 20);
    $table->string('city', 50);
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_banks');
    }
};
