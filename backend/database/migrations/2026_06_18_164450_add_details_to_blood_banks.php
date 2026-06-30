<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_banks', function (Blueprint $table) {
            $table->string('facility_type')->nullable()->after('name');
            $table->string('working_hours')->nullable()->after('phone');
            $table->string('operational_status')->default('active')->after('working_hours');
        });
    }

    public function down(): void
    {
        Schema::table('blood_banks', function (Blueprint $table) {
            $table->dropColumn(['facility_type', 'working_hours', 'operational_status']);
        });
    }
};
