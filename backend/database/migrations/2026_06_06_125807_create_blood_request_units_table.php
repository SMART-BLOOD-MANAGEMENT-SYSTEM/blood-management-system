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
        Schema::create('blood_request_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('blood_requests')->onDelete('cascade');
            $table->foreignId('inventory_id')->constrained('blood_inventory')->onDelete('cascade');
            $table->integer('units_used');
            $table->timestamp('delivered_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_request_units');
    }
};
