<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Contoh: Tanda Tangan PT. GKA
            $table->dateTime('start_time'); // Tgl & Jam Mulai
            $table->dateTime('end_time')->nullable(); // Tgl & Jam Selesai
            $table->string('location')->nullable(); // Contoh: Kantor / Rumah Klien
            $table->string('color')->default('blue'); // Label Warna (Merah/Biru/Hijau)
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
