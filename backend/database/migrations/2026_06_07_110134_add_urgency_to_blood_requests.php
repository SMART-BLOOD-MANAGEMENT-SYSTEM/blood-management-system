<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->string('urgency_level')->default('normal')->after('status');
            $table->string('patient_name')->nullable()->after('urgency_level');
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropColumn('urgency_level');
            $table->dropColumn('patient_name');
        });
    }
};
