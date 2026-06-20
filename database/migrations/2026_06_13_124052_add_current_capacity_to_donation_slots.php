<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_slots', function (Blueprint $table) {
            $table->integer('current_capacity')->default(0)->after('max_capacity');
        });
    }

    public function down(): void
    {
        Schema::table('donation_slots', function (Blueprint $table) {
            $table->dropColumn('current_capacity');
        });
    }
};
