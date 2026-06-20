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
        Schema::create('blood_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->string('blood_type');
    $table->integer('units_needed');
    $table->string('status')->default('pending');
    $table->text('reason')->nullable();
    $table->foreignId('bank_id')->constrained('blood_banks')->onDelete('cascade');
// تأكدي من وجود جدول باسم 'blood_banks' أو تغيير الاسم حسب جدول بنوك الدم لديك
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_requests');
    }
};
