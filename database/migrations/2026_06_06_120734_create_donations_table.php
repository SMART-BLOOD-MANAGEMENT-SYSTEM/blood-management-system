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
         // الأمر في التيرمينال: php artisan make:migration create_donations_table
Schema::create('donations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('blood_bank_id')->constrained('blood_banks')->onDelete('cascade');
    $table->string('blood_type'); // يمكن أن يكون ENUM أو string
    $table->date('donation_date');
    $table->string('status'); // e.g., 'pending', 'completed', 'rejected'
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
