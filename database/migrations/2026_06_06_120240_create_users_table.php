<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // إنشاء أنواع البيانات المخصصة (ENUMs) في PostgreSQL
        DB::statement("DROP TYPE IF EXISTS role_enum");
        DB::statement("DROP TYPE IF EXISTS blood_type_enum");
        DB::statement("DROP TYPE IF EXISTS gender_enum");
        DB::statement("CREATE TYPE role_enum AS ENUM ('donor', 'admin', 'doctor')");
        DB::statement("CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')");
        DB::statement("CREATE TYPE gender_enum AS ENUM ('male', 'female')");

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 100);
            $table->string('email', 100)->unique();
            $table->text('password_hash');
            $table->string('phone', 20)->unique()->nullable();

            // استخدام الأعمدة مع أنواع البيانات الجديدة
            $table->string('role');
            $table->string('blood_type')->nullable();
            $table->string('gender')->nullable();

            $table->date('birth_date')->nullable();
            $table->string('city', 50)->nullable();
            $table->boolean('is_eligible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        // حذف الأنواع عند التراجع
        DB::statement("DROP TYPE IF EXISTS role_enum");
        DB::statement("DROP TYPE IF EXISTS blood_type_enum");
        DB::statement("DROP TYPE IF EXISTS gender_enum");
    }
};
