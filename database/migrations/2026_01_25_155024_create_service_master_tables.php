<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tipe Layanan (Notaris, PPAT, Pengurusan/Jasa Lain)
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: Notaris, PPAT
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 2. Daftar Layanan Spesifik (Akta Jual Beli, Pendirian PT, Balik Nama)
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_type_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Contoh: Akta Jual Beli (AJB)
            $table->string('code')->nullable(); // Kode internal
            $table->decimal('default_price', 15, 2)->default(0); // Harga dasar (bisa diubah nanti)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_types');
    }
};
